from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

#from app import views


urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'pinsDown.views.home', name='home'),
    # ('^$', views.index)
    ('^$', 'app.views.index'),
    ('^submitTheft$', 'app.views.submitTheft'),
    ('^getThefts$', 'app.views.getThefts')
#    url(r'^$', 'pinsDown.views.home', include('pinsDown.views.index'))
    #url(r'^pinsDown/', include('pinsDown.views.index')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
