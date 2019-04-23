# Vehicle Lifecycle Cost and Emission Impact Tool
To educate consumers on the effective environmental and financial impact of their vehicle use.

# Description
This package contains all files/scripts necessary to run the Vehicle Lifecycle Cost and Emission Impact Tool.  The main directory contains index.html, style.css, and script.js; the three main files to run the tool.  Inside eia_api is a python script which connects to the EIAs API to collect and clean the data used, which is also stored in that directory.  the images directory contains website images, and lib contains extra JavaScript librairies such as D3.

# Installation
Minimal installation is necessary.  However, some setup must happen before the tool will run properly locally.  Should you wish to run the tool locally, follow the guidelines below.  The tool can be accessed without any installation by going to our [website](https://github.gatech.edu/pages/Keeping-It-On-The-DL/EVEmissionsCalc/).

1. Collect Grid Data: 
 - Run eia_api.py in the command line, a required input is an EIA API key, see below
 - Standard Python libraries are used, plus Pandas.
 - An EIA key is necessary to run, one can be registered for free at https://www.eia.gov/opendata/
 - The key is an input, like so: `python eia_api.py <key>`

2. Collect Vehicle Data:
 - The raw vehicle data used in this project can be found at www.fueleconomy.gov.
 - vehicles.py can then be run on the data to reduce and format it into the proper form.

3. Collect Fuel Prices:
- Raw vehicle prices can be collected into a csv file from www.gasprices.aaa.com

# Execution
Once the necessary data has been loaded, simply running index.html will open the tool, which is self-explanitory.
- The tool has been tested in Mozilla Firefox only, other browsers may or may not be supported
