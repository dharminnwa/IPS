using System.Globalization;
using IPS.Business;
using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.OData;
using IPS.BusinessModels.UserModel;
using IPS.WebApi.Filters;
using IPS.AuthData.Models;

namespace IPS.WebApi.Controllers
{
    [Authorize]
    public class UserController : BaseController
    {
        IUserService _service;
        IAuthService _authService;
        private readonly IpsUserService ipsUserService;

        public UserController(IUserService userService, IAuthService authService, IpsUserService ipsUserSer)
        {
            _service = userService;
            _authService = authService;
            ipsUserService = ipsUserSer;
        }

        [EnableQuery]
        [HttpGet]
        public IQueryable<User> GetUsers()
        {
            return _service.Get();
        }

        [EnableQuery]
        [HttpGet]
        public SingleResult<User> GetUser(int id)
        {
            return SingleResult.Create(_service.GetQueryableUser(id));
        }

        //[EnableQuery]
        //[HttpGet]
        //public UserViewModel GetUser(int id)
        //{
        //    var user = SingleResult.Create(_service.GetById(id)).Queryable.First();

        //    //TODO integrate _authService 
        //    var service = new AuthService();
        //    var password = service.GetUserPlainPassword(user.UserKey);
        //    var pwVm = new ResetPasswordViewModel
        //    {
        //        UserId = user.UserKey,
        //        NewPassword = password,
        //        ConfirmNewPassword = password
        //    };
        //    var result = new UserViewModel(user, pwVm);
        //    return result;
        //}

        [EnableQuery]
        [HttpGet]
        [Route("api/User/CoWorkers")]
        public IQueryable<User> GetCurrentUserCoWorkers()
        {
            IpsUser user = _authService.getCurrentUser();
            return _service.GetUsers(user.Id);
        }

        [HttpPost]
        [ResourcePermisionAuthorize(ResourceKey = "users", OperationKey = Operations.Create)]
        public IHttpActionResult Add(User user)
        {
            if (!ModelState.IsValid)
            {

                return BadRequest(ModelState);
            }

            User result = _service.Add(user);

            return Ok(result.Id);

        }

        [HttpPut]
        [ResourcePermisionAuthorize(ResourceKey = "users", OperationKey = Operations.Update)]
        public IHttpActionResult Update(User user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            User original = _service.GetById(user.Id);

            if (original == null)
            {
                return NotFound();
            }

            try
            {
                bool result = _service.Update(user);

                return Ok(result);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpDelete]
        [ResourcePermisionAuthorize(ResourceKey = "users", OperationKey = Operations.Delete)]
        public IHttpActionResult Delete(int id)
        {
            User user = _service.GetById(id);

            if (user == null)
            {
                return NotFound();
            }

            bool result = _service.Delete(user);

            return Ok(result);
        }

        [HttpPost]
        [Route("api/User/UpdateUserProfileImage")]
        public void UpdateUserProfileImage(int userId, string imagePath)
        {
            _service.UpdateImagePath(userId, imagePath);

            User user = _service.GetById(userId);

            if (user != null)
            {
                ipsUserService.UpdateImagePath(user.UserKey, imagePath);
            }
        }

        [HttpGet]
        [Route("api/User/IsEmailExist/{email}")]
        public bool IsEmailExist(string email)
        {
            return _service.IsEmailExist(email);
        }

        [HttpGet]
        [Route("api/User/getUsersBySearchText/{searchText}")]
        public List<IpsUserModel> GetUsersBySearchText(string searchText)
        {
            return _service.GetUsersBySearchText(searchText);
        }

        [HttpGet]
        [Route("api/User/GetUsersList")]
        public List<IpsUserModel> GetUsersList()
        {
            return _service.GetUsersList();
        }


    }
}