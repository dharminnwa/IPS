using System.Web.Http;
using IPS.WebApi.Providers;
using Microsoft.Owin;
using Microsoft.Owin.Security.Facebook;
using Microsoft.Owin.Security.Google;
using Microsoft.Owin.Security.OAuth;
using Owin;
using System;
using IPS.Business;
using IPS.Business.Interfaces;
using IPS.AuthData.Models;
using Microsoft.AspNet.Identity;
using IPS.AuthData.Managers;
using IPS.WebApi.App_Start;

[assembly: OwinStartup(typeof(IPS.WebApi.Startup))]
namespace IPS.WebApi
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            //app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);
            HttpConfiguration config = new HttpConfiguration();

            //config.DependencyResolver = new NinjectResolver(NinjectConfig.CreateKernel());
            OAuthConfig.ConfigureOAuth(app);

            //app.UseWebApi(config);

            //app.UseNinjectMiddleware(NinjectConfig.CreateKernel).UseNinjectWebApi(config);
        }
    }
}