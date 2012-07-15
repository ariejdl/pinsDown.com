### About
- running at [pinsDown.com](http://www.pinsDown.com) (heroku), seems to go to sleep so may need two requests
- no git history since contained database credentials
- This was my first django project, was for a crime data + journalism weekend hack (30th June 2012) I coded + designed, and collaborated with journalist [@brokenbottleboy](http://www.twitter.com/brokenbottleboy), basically did a few hours on saturday and sunday only.  It uses initScript.scpt also found on this github.  Pleased with the clean javascript front-end.
- Only tested on webkit, but works on modern versions of firefox too.  Makes extensive use of css3 transitions, I indulged myself here since it was a weekend job.

### Dev ReadMe

start server:
python pinsDown/manage.py runserver

you will want to add your own database credentials here, didn't get to point of using a config file
pinsDown/app/models/userSubmitted.py

* * *

initially following this:
https://github.com/craigkerstiens/django-helloworld

installed pip with this
http://www.pidby.com/2009/07/installing-pip-and-ipython-on-mac.html

then:
sudo install virtualenv