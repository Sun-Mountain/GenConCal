<!-- Curl Zip File -->

curl https://www.gencon.com/downloads/events.zip -L -O events.zip

<!-- Install Unzip and Unzip File -->

sudo apt-get install unzip
unzip file.zip -d destination_folder

<!-- Save to JSON and save to location -->

convert-excel-to-json --sourceFile="events.xlsx" > events.json

<!-- EXTRA: parse json to more readable format -->