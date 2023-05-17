<script lang="ts">
// @ts-nocheck

  import events from '../lib/data/events.json';
  // Generate times
  const timeInt = 15;
  /**
	 * @type {string[]}
	 */
  const timeList = [];
  const ap = ["AM", "PM"];

  let tt = 0;

  for (let i = 0; tt < 24 * 60; i++) {
    const hh = Math.floor(tt / 60);
    const mm = tt % 60;
    timeList[i] = ("0" + (hh % 12)).slice(-2) + ":" + ("0" + mm).slice(-2) + ap[Math.floor(hh / 12)];
    tt = tt + timeInt;
  }

  const dayList = [{
      date: "08/02/2023",
      times: timeList,
      events: {
        am: [],
        pm: []
      }
    }, {
      date: "08/03/2023",
      times: timeList,
      events: {
        am: [],
        pm: []
      }
    }, {
      date: "08/04/2023",
      times: timeList,
      events: {
        am: [],
        pm: []
      }
    }, {
      date: "08/05/2023",
      times: timeList,
      events: {
        am: [],
        pm: []
      }
  }]

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const startDate = event["Start Date & Time"].slice(0,10);
    const timeSuffix = event["Start Date & Time"].slice(-2);

    for(let i = 0; i < dayList.length; i++) {
      const date = dayList[i];
      if (startDate === date["date"]) {
        // date["events"].push(event)

        if (timeSuffix === "AM") {
          date["events"]["am"].push(event);
        }
        if (timeSuffix === "PM") {
          date["events"]["pm"].push(event);
        }
      }
      date["events"]["am"].sort(function(a, b){
        if(a["Start Date & Time"] < b["Start Date & Time"]) { return -1; }
        if(a["Start Date & Time"] > b["Start Date & Time"]) { return 1; }
        return 0;
      })
      date["events"]["pm"].sort(function(a, b){
        if(a["Start Date & Time"] < b["Start Date & Time"]) { return -1; }
        if(a["Start Date & Time"] > b["Start Date & Time"]) { return 1; }
        return 0;
      })
    }
  }
</script>

<div id="calendar-container">
  <div id="calendar">
    <div id="days">
      {#each dayList as day}
        <div class="day-column">
          <h1>
            {day.date}
          </h1>
          {#each day.events.am as event}
            <div>
              {event.Title} - {event["Start Date & Time"]}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  #days {
    display: flex;
    flex-direction: row;
  }
</style>