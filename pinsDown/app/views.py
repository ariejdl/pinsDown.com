from django.template import Context, loader
from django.http import HttpResponse

from django.utils import simplejson

from app.models.UserSubmitted import UserSubmitted
model = UserSubmitted()

from django.views.decorators.csrf import csrf_exempt

def index(request):
    t = loader.get_template('../templates/index.html')
    c = Context({
       'test': 'a string is here'
    })
    return HttpResponse(t.render(c))
#    return HttpResponse("Below world")


@csrf_exempt
def submitTheft(request):
    #curl -d "param1=value1&param2=value2" http://127.0.0.1:8000/giveData
    if request.method == 'POST':
        try :
            #print 'a'
            processed = simplejson.loads(request.raw_post_data)  
            if (processed):
                #print 'b'
                lat = processed['lat']
                lng = processed['lng']
                clientIP =  request.META['REMOTE_ADDR']
                #print 'c'
                #model.clearDB()
                model.printDB()
                if (model.unusedIP(clientIP)):
                    #print 'd'
                    model.addLoc(lat, lng, clientIP)
                else:
                    return HttpResponse("""{"result":"good","alreadyHave":true}""")    
            else: 
                return HttpResponse("""{"error":true,"processingError":true}""")
        except :
            raise
            return HttpResponse("""{"error":true}""")


    return HttpResponse("""{"result":"good"}""")


@csrf_exempt
def getThefts(request):
    try:
        processed = simplejson.loads(request.raw_post_data)
        lat = processed['lat']
        lng = processed['lng']
        results = model.getLoc(lat, lng)

        out = []
        for i in results:
            out.append({'lat':i["loc"][0], 'lng': i["loc"][1]})

        return HttpResponse(simplejson.dumps({'data': out }))
        
    except:
        #raise
        return HttpResponse("""{"error":true}""")

    return HttpResponse("""{"error":true}""")
