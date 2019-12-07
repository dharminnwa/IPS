using IPS.AuthData.Models;
using IPS.Business;
using IPS.Business.Interfaces;
using IPS.WebApi;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Infrastructure;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace IPS.WebApi.Providers
{
    public class SimpleRefreshTokenProvider : IAuthenticationTokenProvider
    {
        public void Create(AuthenticationTokenCreateContext context)
        {
            var clientid = context.Ticket.Properties.Dictionary["as:client_id"];

            if (string.IsNullOrEmpty(clientid))
            {
                return;
            }

            var refreshTokenId = Guid.NewGuid().ToString("n");

            var refreshTokenLifeTime = context.OwinContext.Get<string>("as:clientRefreshTokenLifeTime");

            var token = new RefreshToken()
            {
                Id = Helper.GetHash(refreshTokenId),
                ClientId = clientid,
                Subject = context.Ticket.Identity.Name,
                IssuedUtc = DateTime.UtcNow,
                ExpiresUtc = DateTime.UtcNow.AddMinutes(Convert.ToDouble(refreshTokenLifeTime))
            };

            context.Ticket.Properties.IssuedUtc = token.IssuedUtc;
            context.Ticket.Properties.ExpiresUtc = token.ExpiresUtc;

            token.ProtectedTicket = context.SerializeTicket();
            bool result;
            using (IAuthService authService = (IAuthService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IAuthService)))
            {
                result = authService.AddRefreshToken(token);
            }

            if (result)
            {
                context.SetToken(refreshTokenId);
            }
            
        }

        public void Receive(AuthenticationTokenReceiveContext context)
        {

            var allowedOrigin = context.OwinContext.Get<string>("as:clientAllowedOrigin");
            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { allowedOrigin });

            string hashedTokenId = Helper.GetHash(context.Token);

            RefreshToken refreshToken;
            using (IAuthService authService = (IAuthService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IAuthService)))
            {
                refreshToken = authService.FindRefreshToken(hashedTokenId);
            }

            if (refreshToken != null)
            {
                //Get protectedTicket from refreshToken class
                context.DeserializeTicket(refreshToken.ProtectedTicket);
                bool result;
                using (IAuthService authService = (IAuthService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IAuthService)))
                {
                    result = authService.RemoveRefreshToken(hashedTokenId);
                }
                
            }
            
        }

        public async Task CreateAsync(AuthenticationTokenCreateContext context)
        {
            var clientid = context.Ticket.Properties.Dictionary["as:client_id"];

            if (string.IsNullOrEmpty(clientid))
            {
                return;
            }

            var refreshTokenId = Guid.NewGuid().ToString("n");

            var refreshTokenLifeTime = context.OwinContext.Get<string>("as:clientRefreshTokenLifeTime");

            var token = new RefreshToken()
            {
                Id = Helper.GetHash(refreshTokenId),
                ClientId = clientid,
                Subject = context.Ticket.Identity.Name,
                IssuedUtc = DateTime.UtcNow,
                ExpiresUtc = DateTime.UtcNow.AddMinutes(Convert.ToDouble(refreshTokenLifeTime))
            };

            context.Ticket.Properties.IssuedUtc = token.IssuedUtc;
            context.Ticket.Properties.ExpiresUtc = token.ExpiresUtc;

            token.ProtectedTicket = context.SerializeTicket();

            bool result;
            using (IAuthService authService = (IAuthService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IAuthService)))
            {
                result = authService.AddRefreshToken(token);
            }

            if (result)
            {
                context.SetToken(refreshTokenId);
            }

            await Task.Run(() => { });
        }

        public async Task ReceiveAsync(AuthenticationTokenReceiveContext context)
        {
            var allowedOrigin = context.OwinContext.Get<string>("as:clientAllowedOrigin");
            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { allowedOrigin });

            string hashedTokenId = Helper.GetHash(context.Token);

            RefreshToken refreshToken;
            using (IAuthService authService = (IAuthService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IAuthService)))
            {
                refreshToken = authService.FindRefreshToken(hashedTokenId);
            }

            if (refreshToken != null)
            {
                //Get protectedTicket from refreshToken class
                context.DeserializeTicket(refreshToken.ProtectedTicket);
                bool result;
                using (IAuthService authService = (IAuthService)GlobalConfiguration.Configuration.DependencyResolver.GetService(typeof(IAuthService)))
                {
                    result = authService.RemoveRefreshToken(hashedTokenId);
                }
            }

            await Task.Run(() => { });
        }
    }
}