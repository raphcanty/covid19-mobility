# covid19-mobility
King's College London Masters Dissertation: change in travel demand in London due to the coronavirus pandemic.

Contains several datasets from different sources all pertaining to transport demand in London during the COVID-19 Pandemic.

### `/data_sources`
Directory containing raw data downloaded from Apple, Google, Waze, Citymapper, TomTom or others. Often contains many countries/cities which are not needed for this analysis of London.

All sources are licensed to be used for this purpose. TomTom data is from (Github)[https://github.com/ActiveConclusion/COVID19_mobility] and is Copyright (c) 2020 ActiveConclusion.

### Jupyter Notebooks
In this directory, there is a Jupyter Notebook for every data source, where raw data is converted into the desired format. This also allows for statistics to be generated, such as the percentage decline in travel, to the be quoted in a report.

### `/datasets`
Processed datasets containing London transport data in a simple format: rows of dates with a transport index / percent change in columns.

### `/figures`
Charts created using Datawrapper to visualise data in `datasets`.

The King's College Avowel is also included, affirming that this work is not plaigurised and is my own work.
