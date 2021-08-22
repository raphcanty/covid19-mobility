# covid19-mobility
King's College London Masters Dissertation: change in travel demand in London due to the coronavirus pandemic.

Analysis and integration of several datasets from different sources all pertaining to transport demand in London during the COVID-19 Pandemic.

### `/data_sources`
Directory containing raw data downloaded from [Apple](https://covid19.apple.com/mobility), [Citymapper](https://citymapper.com/cmi), [Google](https://www.google.com/covid19/mobility/), [Waze](https://www.waze.com/covid19), [TomTom](https://www.tomtom.com/en_gb/traffic-index/london-traffic/), Transport for London [via GOV.UK for Tube & Bus data](https://www.gov.uk/government/statistics/transport-use-during-the-coronavirus-covid-19-pandemic) and [directly for Cycle Hire data](https://cycling.data.tfl.gov.uk).

All sources are licensed to be used for this research purpose. TomTom data is from [Github](https://github.com/ActiveConclusion/COVID19_mobility) and is Copyright (c) 2020 ActiveConclusion.

Also considered are New York, Sydney and Hong Kong for datasets except for TfL data. Waze does not contain data regarding Hong Kong.

### `/notebooks`
In this directory, there is a Jupyter Notebook for every data source, where raw data is converted into the desired format. This also allows for statistics to be generated, such as the percentage decline in travel, to the be quoted in a report. One notebook generates a mobility index for TfL Cycle Hire data, and another integrates every data source together into a single csv file for use in visualisations.

### `/datasets`
Processed datasets containing London transport data in a simple format: rows of dates with a transport index / percent change in columns.

### `/figures`
Charts captured from D3 or created using Datawrapper to visualise data in `datasets`.

### `London Bus Data`
Analysis of London bus speed data from [TfL](https://tfl.gov.uk/corporate/publications-and-reports/buses-performance-data).

The King's College Avowel is also included, affirming that this work is not plaigurised and is my own work.
