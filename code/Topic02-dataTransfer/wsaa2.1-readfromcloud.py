# newer version of a program that gets the bit coin price in euro
# This was tested on the 4 Feb 2026 and works
# Author: Andrew Beatty

import requests
import json
# this is flakey at the moment
url = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/btc.json"
response = requests.get(url)
data = response.json()
#with open("bitcoindump.json", "w") as fp:
#    json.dump(data, fp)

eurorate = data["btc"]["eur"]

print(f"bitcoin in euroa is €{eurorate:.2f}")


