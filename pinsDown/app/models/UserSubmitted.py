# http://api.mongodb.org/python/2.0.1/examples/geo.html
#db.user_submitted.ensureIndex( { loc : "2d" } )

from pymongo import Connection
import time

databaseName = "LocTweets"
connection = Connection('localhost', 27017)

db = connection[databaseName]
#db.authenticate('private', 'private')
userSubmitted = db['user_submitted']

class UserSubmitted():
    def now(self):
        return int(round(time.time() * 1000))

    def printDB(self):
        res = userSubmitted.find()
        for i in res:
            print i['ipAddr']

    def clearDB(self):
        userSubmitted.remove()

    def addLoc(self, lat, lng, ipAddr):
        person = {
            "loc": [lat,lng],
            "when": self.now(),
            "ipAddr": ipAddr
        }

        userSubmitted.save(person)

    def unusedIP(self, ip):
        compareTime = self.now() - (7 * 24 * 60 * 60 * 1000)
        results = userSubmitted.find({'ipAddr': ip, 'when': {'$gt':compareTime}})
        return (results.count() == 0)

    def getLoc(self, lat, lng):
        return userSubmitted.find({"loc": {"$within": {"$center": [[lat, lng], 10]}}}).limit(20)

       

