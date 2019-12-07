using IPS.BusinessModels.UserModel;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace IPS.Business.Interfaces
{
    public interface IUserService : IDisposable
    {
        User Add(User user);
        bool Delete(User user);
        IQueryable<User> Get();
        User GetById(int id);
        IQueryable<User> GetQueryableUser(int id);
        IQueryable<User> GetUsers(string userKey);
        IQueryable<User> GetUserByKey(string userKey);
        bool Update(User user);

        void UpdateImagePath(int userId, string imagePath);
        bool IsEmailExist( string email);
        List<IpsUserModel> GetUsersBySearchText(string searchText);
        List<IpsUserModel> GetUsersList();
    }
}
