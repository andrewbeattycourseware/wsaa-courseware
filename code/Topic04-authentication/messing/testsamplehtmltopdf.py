import requests

url = "https://en.wikipedia.org"
apiKey = "eAs3mWn7R59gxZ6kSYysYdpTUsivY7Am74aSN36pOHdMMyTu3XDpdSOtaAySz3qF"
linkRequests = "https://api.html2pdf.app/v1/generate?html={0}&apiKey={1}".format(url, apiKey)

result = requests.get(linkRequests).content

with open("documenttest.pdf", "wb") as handler:
    handler.write(result)