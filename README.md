# covid19-mobility
King's College London Master's Dissertation: analysing London's change in travel demand due to the coronavirus pandemic.

Involves analysis of several mobility-related datasets from different sources, linking government-imposed COVID-19 restrictions with change in citizen behaviour as observed in these datasets.

### `/data_sources`
Directory containing raw data downloaded from [Apple](https://covid19.apple.com/mobility), [Citymapper](https://citymapper.com/cmi), [Google](https://www.google.com/covid19/mobility/), [Waze](https://www.waze.com/covid19), [TomTom](https://www.tomtom.com/en_gb/traffic-index/london-traffic/), Transport for London [via GOV.UK for Tube & Bus data](https://www.gov.uk/government/statistics/transport-use-during-the-coronavirus-covid-19-pandemic) and [directly for Cycle Hire data](https://cycling.data.tfl.gov.uk).

All sources are licensed to be used for this research purpose. TomTom data is from [Github](https://github.com/ActiveConclusion/COVID19_mobility) and is Copyright (c) 2020 ActiveConclusion.

Also considered are New York, Sydney and Hong Kong for datasets except for TfL data. Waze does not contain data regarding Hong Kong.

### `/datasets`
Processed datasets containing London, Sydney, New York and Hong Kong transport data in a simple format: rows of dates with a transport index / percent change in columns.

File `all_<city>.csv` contains all data in a standardised format.

### `/docs`
Contains web files for companion website at [https://raphcanty.github.io/covid19_mobility](https://raphcanty.github.io/covid19_mobility). This includes D3 Javascript visualisations.

Called `docs` because only directories with this name may be hosted specifically by GitHub Pages.

### `/figures`
Charts captured from D3 or created using [Datawrapper](https://datawrapper.de) to visualise data in `datasets`.

### `/notebooks`
In this directory, there is a Jupyter Notebook for every data source, where raw data is converted into the desired format.

There is also a `stats.ipynb` file, used to generate statistics as needed for the report.

One notebook generates a mobility index for TfL Cycle Hire data, and another integrates every data source together into a single csv file for use in visualisations.

### `/London Bus Data`
Analysis of London bus speed data from [TfL](https://tfl.gov.uk/corporate/publications-and-reports/buses-performance-data).

The King's College Avowel is also included, affirming that this work is not plagiarised and is my own work.
