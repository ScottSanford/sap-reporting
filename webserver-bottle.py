#!/usr/bin/python

"""
webserver-bottle.py: A webserver that mimics the Interactives platform on iOS and Android. 
Requires the Python Bottle web framework.
"""

__author__      = "Jason Shah"
__copyright__   = "Copyright 2013-2015, Mediafly, Inc."
__version__     = "1.1"



from bottle import route, get, post, put, run, static_file, request, response, abort
from pprint import pprint
from json import dumps
import re
import json
import sys
reload(sys)
sys.setdefaultencoding("utf-8")


# Helper functions
### convertAndReformatForJson performs the following transformations:
### 1. Converts strings from Unicode to UTF-8, as JSON chokes on Python-style Unicode strings
### 2. Convert mfly://data/image/ prefixes to Placeholder.it links
### 3. Convert Python True/False/None to JavaScript true/false/{empty string}
def convertAndReformatForJson(input):
    if isinstance(input, dict):
        return {convertAndReformatForJson(key): convertAndReformatForJson(value) for key, value in input.iteritems()}
    elif isinstance(input, list):
        return [convertAndReformatForJson(element) for element in input]
    elif isinstance(input, unicode):
        input = input.replace('mfly://data/image/', 'http://placehold.it/600x600&text=')
        return input.encode('utf-8')
    else:
        if (input == True and str(input) == "True"):
            return True
        if (input == False and str(input) == "False"):
            return False
        if (input == None):
            return ""
        if isinstance(input, str):
            input = input.replace('mfly://data/image/', 'http://placehold.it/600x600&text=')
        return input




###
### Initialization
###
# mflyDataInit return value
mflyDataInit_response = {
    'user': "jdoe@mediafly.com",
    'displayName': "John Doe",
    'id': "5559d4a298225972b02301597product82851",
    'item': "Name of This Item",
    'osType': "Development",
    'osVersion': "6.1.3",
    'appVersion': "6.1.4.405",
    'deviceId': "46a5f0630a13a8744e8b5cc6309b46",
    'appId': "1de8c94235905abbbf7638acce",
    'lastUpdated': "2014-02-03T07:04:07-06:00"
}



# Load hierarchy into memory

json_file = open('scripts/hierarchy.json')
hierarchy = convertAndReformatForJson(json.load(json_file))
isOnline = True


##########################
# Save and restore state #
##########################
memory = {}

@get('/data/info/<key:re:.*>')
def getOrPut(key):
    print "Get Or Put. key=" + key + "  body=" + request.query.body + "  method="+request.query.method + "  value=" + request.query.value
    method = request.query.method
    value = request.query.value
    if method.lower() != "put":
        # Treat as GET
        if key not in memory.keys():
            abort(404)
        return memory[key]
    else:
        # Treat as PUT
        memory[key] = value


@get('/data/info')
def getMany():
    print "Get Many. body=" + request.query.body + "  prefix="+request.query.prefix
    prefix = request.query.prefix
    if prefix:
        print "GET PREFIX " + prefix
        if sys.version_info.major == 2:
            return {k:v for (k,v) in memory.iteritems() if k.startswith(prefix)}
        else:
            return {k:v for (k,v) in memory.items() if k.startswith(prefix)}
    else:
        return memory
         


##############
# Get Folder #
##############

@get('/data/folder/<id:re:.*>')
def getFolder(id):
    if id in hierarchy:
        # Now lets construct the folder
        folder = []
        this_folder = hierarchy[id]
        if this_folder['items']:
            for itemkey in this_folder['items']:
                folder.append(hierarchy[itemkey])
            return json.dumps(folder)
        else:
            return '[]'
    else:
        abort(404, id + ' not found')

############
# Get Item #
############

@get('/data/item/<id:re:.*>')
def getItem(id):
    if id in hierarchy:
        return json.dumps(hierarchy[id])
    else:
        abort(404, id + ' not found')

##############
# Downloader #
##############
@get('/data/download/status')
def getDownloadStatus():
    return '{ "progress": 0.12, "fails": 1 }'
@get('/data/download/status/<id:re:.*>')
def getDownloadStatusForItem(id):
    return '{ "progress": 0.5 }'



##########
# Search #
##########

DO_NOT_SEARCH_LIST = ["autoStart", "id", "items", "thumbnailUrl", "type", "url", "launched", "progress", "pages"]
@get('/data/search')
def search():
    term = request.query.term

    print 'term is ' + term

    ret = []
    for k in hierarchy:
        if (k != 'version'):
            for v in hierarchy[k]:
                if not(v in DO_NOT_SEARCH_LIST) and type(hierarchy[k][v]) is str and term in hierarchy[k][v]:
                    ret.append(hierarchy[k])
                elif v == 'keywords':
                    for keywords in hierarchy[k][v]:
                        if term in keywords:
                            ret.append(hierarchy[k])
    return json.dumps(ret)


###############
# Other calls #
###############


@get('/data/onlineStatus')
def getOnlineStatus():
    print 'GetOnlineStatus: isOnline=' + str(isOnline)
    isOnlineString = 'online' if isOnline else 'offline'
    return '{ "status": "' + isOnlineString + '" }'



#############
# Heartbeat #
#############
@get('/_heartbeat')
def hearbeat():
    global isOnline
    if (request.query.isOnline != ''):
        print 'Heartbeat: isOnline=' + str(isOnline)
        isOnline = True if (request.query.isOnline == 'true') else False
        print 'Heartbeat: isOnline set to ' + str(isOnline) + '  request.query.isOnline = ' + str(request.query.isOnline)

    seq = int(request.query.seq)
    if seq == 0:
        print 'mflyDataInit'
        return "mflyDataInit(" + str(json.dumps(mflyDataInit_response)) + ")"
    elif seq == 1:
        print 'mflyResume'
        return "mflyResume()"
    elif seq == 2:
        print 'mflyInit'
        return 'mflyInit(' + str(json.dumps(hierarchy)) + ')'
    return ''



#################
# Static Routes #
#################
@get('/')
def index():
    return static_file('index.html', root='./')

@get('/partials/<filename:re:.*\.html>')
def javascripts(filename):
    return static_file(filename, root='./partials')

@get('/js/<filename:re:.*\.js>')
def javascripts(filename):
    return static_file(filename, root='./js')

@get('/lib/<filename:re:.*\.js>')
def js_libraries(filename):
    return static_file(filename, root='./lib')

@get('/css/<filename:re:.*\.css>')
def stylesheets(filename):
    return static_file(filename, root='./css')

@get('/images/<filename:re:.*\.(jpg|png|gif|ico)>')
def images(filename):
    return static_file(filename, root='./images')

@get('/fonts/<filename:re:.*\.(eot|ttf|woff|svg)>')
def fonts(filename):
    return static_file(filename, root='./fonts')



run(host='127.0.0.1', port=8000, debug=True, reloader=True)

