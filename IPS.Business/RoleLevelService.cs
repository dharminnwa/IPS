using IPS.AuthData;
using IPS.AuthData.Models;
using IPS.Business.Interfaces;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.ResourceModels;
using IPS.BusinessModels.RoleModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class RoleLevelService : BaseService, IRoleLevelService
    {

        private ApplicationDbContext _context;
        public RoleLevelService()
        {
            _context = ApplicationDbContext.Create("IdentityConnection");
        }
        public static List<UserRoleLevels> list = new List<UserRoleLevels>();


        public List<IpsRoleLevelModel> getRoleLevels()
        {
            List<IpsRoleLevelModel> RoleLevels = _context.UserRoleLevels.Select(x => new IpsRoleLevelModel()
            {
                Id = x.Id,
                Name = x.Name,
                OrganizationId = x.OrganizationId,
                ParentRoleLevelId = x.ParentRoleLevelId,
                ParentRoleLevelName = x.ParentRoleLevelId != null ? _context.UserRoleLevels.Where(y => y.Id == x.ParentRoleLevelId).FirstOrDefault().Name : "",
            }).ToList();
            return RoleLevels;
        }

        public List<IpsRoleLevelModel> getRoleLevelsByOrganizationId(int organizationId)
        {
            List<IpsRoleLevelModel> RoleLevels = _context.UserRoleLevels.Where(x => x.OrganizationId == organizationId).Select(x => new IpsRoleLevelModel()
            {
                Id = x.Id,
                Name = x.Name,
                OrganizationId = x.OrganizationId,
                ParentRoleLevelId = x.ParentRoleLevelId,
                ParentRoleLevelName = x.ParentRoleLevelId != null ? _context.UserRoleLevels.Where(y => y.Id == x.ParentRoleLevelId).FirstOrDefault().Name : "",
            }).ToList();
            var test = GetLayers(RoleLevels);



            return RoleLevels;
        }


        public UserRoleLevels Save(UserRoleLevels userRoleLevel)
        {
            if (userRoleLevel.Id > 0)
            {
                UserRoleLevels original = _context.UserRoleLevels.Find(userRoleLevel.Id);
                _context.Entry(original).CurrentValues.SetValues(userRoleLevel);
            }
            else
            {
                _context.UserRoleLevels.Add(userRoleLevel);
            }
            _context.SaveChanges();
            return userRoleLevel;
        }
        public int Delete(int roleLevelId)
        {
            int result = 0;
            if (roleLevelId > 0)
            {
                UserRoleLevels original = _context.UserRoleLevels.Find(roleLevelId);
                if (original != null)
                {
                    if (!(_context.UserRoleLevels.Any(x => x.ParentRoleLevelId == roleLevelId)))
                    {
                        _context.UserRoleLevels.Remove(original);
                        result = _context.SaveChanges();
                    }
                    else
                    {
                        result = -1;
                    }
                }
            }
            return result;
        }

        private List<IpsRoleLevelModel> GetLayers(List<IpsRoleLevelModel> RoleLevels)
        {
            List<IpsRoleLevelModel> data = RoleLevels;

            List<IpsRoleLevelModel> hierarcy = new List<IpsRoleLevelModel>();

            foreach (var layer in data)
            {
                var layer1 = layer;

                var sublayers = data.Where(i => i.ParentRoleLevelId == layer1.Id && i.ParentRoleLevelId != null);

                var enumerable = sublayers as IpsRoleLevelModel[] ?? sublayers.ToArray();

                if (enumerable.Any() && layer.ParentRoleLevelId == null)
                    hierarcy.Add(layer);

                foreach (var sublayer in enumerable)
                {
                    layer.ChildRoleLevel.Add(sublayer);
                }
            }




            return hierarcy;
        }

        private List<IpsRoleLevelModel> GetSubLayers(List<IpsRoleLevelModel> RoleLevels, int CurrentLevelId)
        {
            List<IpsRoleLevelModel> data = RoleLevels.Where(x => x.ParentRoleLevelId == CurrentLevelId).ToList();

            List<IpsRoleLevelModel> hierarcy = new List<IpsRoleLevelModel>();

            foreach (var layer in data)
            {
                bool isStarttracking = false;
                if (layer.Id == CurrentLevelId)
                {
                    isStarttracking = true;
                }
                if (isStarttracking)
                {

                }
            }

            return hierarcy;
        }

        public List<UserRoleLevels> GetRoleLevelChildsRecursive(Int32 roleLevelId)
        {
            list = new List<UserRoleLevels>();
            GetChild(roleLevelId);
            return list;
        }
        public void GetChild(int id) // Pass parent Id
        {
            if (_context.UserRoleLevels.Any(x => x.ParentRoleLevelId == id))
            {
                var childList = _context.UserRoleLevels.Where(x => x.ParentRoleLevelId == id).ToList();
                list.AddRange(childList);
                foreach (var item in childList)
                {
                    GetChild(item.Id);
                }

            }
        }
        public List<IpsUser> GetChildRoleLevelUsersRecursive(Int32 roleLevelId)
        {
            List<IpsUser> result = new List<IpsUser>();
            List<UserRoleLevels> childRoleLevels = new List<UserRoleLevels>();
            childRoleLevels = GetRoleLevelChildsRecursive(roleLevelId);

            UserService userService = new UserService();
            foreach (UserRoleLevels userRoleLevel in childRoleLevels)
            {
                result.AddRange(userService.GetUsersByRoleLevelId(userRoleLevel.Id));
            }

            return result;
        }
    }
}
