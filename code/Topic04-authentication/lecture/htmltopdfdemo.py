# converts a web page to a pdf 
# This is to demonstrate API Keys
# Author: Andrew Beatty


import requests
import urllib.parse
from config import apikeys as cfg

# I found that this program would not work with wikepedia
#targetUrl = "https://en.wikipedia.org/wiki/Main_Page"
# so I am using my URL
targetUrl = "https://andrewbeatty1.pythonanywhere.com/bookviewer.html"
#targetUrl = "https://www.atu.ie/"

apikey = cfg["htmltopdfkey"]
apiurl = 'https://api.html2pdf.app/v1/generate'

params = {'html': targetUrl,'apiKey': apikey}
parsedparams = urllib.parse.urlencode(params)

requestUrl = apiurl +"?" + parsedparams 
print (requestUrl)

response = requests.get(requestUrl)

print (response.status_code)
result =response.content

with open("document.pdf", "wb") as handler:
    handler.write(result)