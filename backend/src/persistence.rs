pub mod event;
pub mod game_master;
pub mod location;
pub mod metadata;

use crate::external_connections;
use crate::external_connections::ConnectionHandle;
use anyhow::{Context, anyhow};
use std::fmt::{Debug, Display};

use sqlx::pool::PoolConnection;
use sqlx::{Acquire, PgConnection, PgPool, Postgres, Transaction};

const PG_PARAM_LIMIT: usize = 65535;

/// Data structure which owns clients for connecting to external systems.
/// Allows business logic to be agnostic of the external systems it communicates with
/// so driven adapters can easily be swapped out for other implementations
#[derive(Clone)]
pub struct ExternalConnectivity {
    db: PgPool,
}

impl ExternalConnectivity {
    /// Accepts the set of clients used to connect to external systems and constructs
    /// an instance of ExternalConnectivity owning those clients
    pub fn new(db: PgPool) -> Self {
        ExternalConnectivity { db }
    }
}

/// A handle from ExternalConnectivity which can connect to a database
pub struct PoolConnectionHandle {
    active_connection: PoolConnection<Postgres>,
}

impl ConnectionHandle for PoolConnectionHandle {
    fn borrow_connection(&mut self) -> &mut PgConnection {
        &mut self.active_connection
    }
}

impl external_connections::ExternalConnectivity for ExternalConnectivity {
    type Handle<'cxn_borrow> = PoolConnectionHandle;

    async fn database_cxn(&mut self) -> Result<Self::Handle<'_>, anyhow::Error> {
        let handle = PoolConnectionHandle {
            active_connection: self.db.acquire().await?,
        };

        Ok(handle)
    }
}

impl external_connections::Transactable for ExternalConnectivity {
    type Handle = ExternalConnectionsInTransaction;

    async fn start_transaction(&self) -> Result<Self::Handle, anyhow::Error> {
        let transaction = self
            .db
            .begin()
            .await
            .context("Starting transaction from db pool")?;

        Ok(ExternalConnectionsInTransaction { txn: transaction })
    }
}

/// A variant of ExternalConnectivity where the database client has an active database transaction
/// which can later be committed
pub struct ExternalConnectionsInTransaction {
    txn: Transaction<'static, Postgres>,
}

/// A handle from ExternalConnectionsInTransaction which can connect to a database
pub struct TransactionHandle<'tx> {
    active_transaction: &'tx mut PgConnection,
}

impl external_connections::ExternalConnectivity for ExternalConnectionsInTransaction {
    type Handle<'tx_borrow>
        = TransactionHandle<'tx_borrow>
    where
        Self: 'tx_borrow;

    async fn database_cxn(&mut self) -> Result<TransactionHandle<'_>, anyhow::Error> {
        let handle = self
            .txn
            .acquire()
            .await
            .context("acquiring connection from database transaction")?;

        Ok(TransactionHandle {
            active_transaction: handle,
        })
    }
}

impl ConnectionHandle for TransactionHandle<'_> {
    fn borrow_connection(&mut self) -> &mut PgConnection {
        &mut *self.active_transaction
    }
}

impl external_connections::TransactionHandle for ExternalConnectionsInTransaction {
    async fn commit(self) -> Result<(), anyhow::Error> {
        self.txn
            .commit()
            .await
            .context("Committing database transaction")?;

        Ok(())
    }
}

/// Utility DTO for consuming the output of the PostgreSQL `count()` function
struct Count {
    count: Option<i64>,
}

#[expect(dead_code)]
impl Count {
    /// Retrieve the count value, as it's typechecked to be optional but should always be present
    fn count(&self) -> i64 {
        self.count
            .expect("count() should always produce at least one row")
    }
}

/// Utility DTO for retrieving the ID of a newly inserted record to PostgreSQL
struct NewId<IdType> {
    id: IdType,
}

#[expect(dead_code)]
/// Converts anything implementing Debug and Display into an [anyhow::Error]
fn anyhowify<T: Debug + Display>(errorish: T) -> anyhow::Error {
    anyhow!(format!("{}", errorish))
}

macro_rules! num_conv_func {
    ($from:ty, $to:ty) => {
        paste::item! {
            fn [<$from _as_ $to>](original: $from) -> $to {
                original as $to
            }
        }
    };
}

// Generates u16_as_i16
num_conv_func!(u16, i16);
// Generates u32_as_i32
num_conv_func!(u32, i32);
