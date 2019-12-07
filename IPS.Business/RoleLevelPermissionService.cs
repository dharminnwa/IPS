using IPS.AuthData.Models;
using IPS.Business.Interfaces;
using IPS.BusinessModels.Enum;
using IPS.BusinessModels.ResourceModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class RoleLevelPermissionService : BaseService, IRoleLevelPermissionService
    {
        private ApplicationDbContext _context;
        public RoleLevelPermissionService()
        {
            _context = ApplicationDbContext.Create("IdentityConnection");
        }

        public List<IpsResourceModel> GetAllResources()
        {
            return _context.Resources.Select(x => new IpsResourceModel()
            {
                Id = x.Id,
                Name = x.Name,
                IsPage = x.IsPage,
                ParentResourceId = x.ParentResourceId
            }).ToList();
        }

        public List<IpsOperationModel> GetAllOperations()
        {
            return _context.Operations.Select(x => new IpsOperationModel()
            {
                Id = x.Id,
                Name = x.Name,
                IsPageLevel = x.IsPageLevel,
            }).ToList();
        }
        public List<IpsRoleLevelResourcesPermissionModel> GetPermissionsByLevelId(int roleLevelId)
        {

            List<IpsRoleLevelResourcesPermissionModel> ipsRoleLevelResourcesPermissionModel = new List<IpsRoleLevelResourcesPermissionModel>();
            ipsRoleLevelResourcesPermissionModel = _context.RoleLevelResourcePermissions.Where(x => x.RoleLevelId == roleLevelId).Select(p => new IpsRoleLevelResourcesPermissionModel()
            {
                Id = p.Id,
                OperationId = p.OperationId,
                RoleLevelId = p.RoleLevelId,
                ResourceId = p.ResourceId
            }).ToList();

            return ipsRoleLevelResourcesPermissionModel;
        }


        //public List<IpsRoleLevelResourcesPermissionModel> GetRoleLevelPermissionsByResourceId(int roleLevelId, int resourceId)
        //{

        //    List<IpsRoleLevelResourcesPermissionModel> ipsRoleLevelResourcesPermissionModel = new List<IpsRoleLevelResourcesPermissionModel>();
        //    ipsRoleLevelResourcesPermissionModel = _context.RoleLevelResourcePermissions.Where(x => x.RoleLevelId == roleLevelId && x.ResourceId == resourceId).Select(p => new IpsRoleLevelResourcesPermissionModel()
        //    {
        //        Id = p.Id,
        //        OperationId = p.OperationId,
        //        RoleLevelId = p.RoleLevelId,
        //        ResourceId = p.ResourceId
        //    }).ToList();

        //    return ipsRoleLevelResourcesPermissionModel;
        //}

        public IpsRoleLevelAdvancePermission GetAdvancePermissionsByLevelId(int roleLevelId)
        {
            IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = new IpsRoleLevelAdvancePermission();
            ipsRoleLevelAdvancePermission = _context.RoleLevelAdvancePermissions.Where(x => x.RoleLevelId == roleLevelId).Select(p => new IpsRoleLevelAdvancePermission()
            {
                Id = p.Id,
                PermissionLevelId = p.PermissionLevelId,
                RoleLevelId = p.RoleLevelId,
            }).FirstOrDefault();
            if (ipsRoleLevelAdvancePermission == null)
            {
                ipsRoleLevelAdvancePermission = new IpsRoleLevelAdvancePermission()
                {
                    Id = 0,
                    RoleLevelId = roleLevelId,
                    PermissionLevelId = (int)PermissionLevelEnum.OwnData
                };
            }

            return ipsRoleLevelAdvancePermission;
        }

        public int Save(IpsRoleLevelPermissionModel ipsRoleLevelPermissionModel)
        {
            int result = 0;
            List<RoleLevelResourcePermission> ipsRoleLevelResourcesPermissionModel = new List<RoleLevelResourcePermission>();
            List<RoleLevelResourcePermission> permissions = new List<RoleLevelResourcePermission>();
            using (var ContextTransaction = _context.Database.BeginTransaction())
            {
                if (_context.RoleLevelResourcePermissions.Any(x => x.RoleLevelId == ipsRoleLevelPermissionModel.RoleLevelId))
                {
                    ipsRoleLevelResourcesPermissionModel = _context.RoleLevelResourcePermissions.Where(x => x.RoleLevelId == ipsRoleLevelPermissionModel.RoleLevelId).ToList();
                    _context.RoleLevelResourcePermissions.RemoveRange(ipsRoleLevelResourcesPermissionModel);
                }
                foreach (IpsRoleLevelResourcesPermissionModel RoleLevelResourcesPermissionModelItem in ipsRoleLevelPermissionModel.IpsRoleLevelResourcesPermissionModels)
                {
                    permissions.Add(new RoleLevelResourcePermission()
                    {
                        RoleLevelId = ipsRoleLevelPermissionModel.RoleLevelId,
                        OperationId = RoleLevelResourcesPermissionModelItem.OperationId,
                        ResourceId = RoleLevelResourcesPermissionModelItem.ResourceId
                    });
                }

                _context.RoleLevelResourcePermissions.AddRange(permissions);
                result = _context.SaveChanges();
                if (result > 0)
                {
                    ContextTransaction.Commit();
                }
                else
                {
                    ContextTransaction.Rollback();
                }
            }
            return result;
        }

        public int SaveAdvancePermission(IpsRoleLevelAdvancePermission roleLevelAdvancePermission)
        {
            int result = 0;
            using (var ContextTransaction = _context.Database.BeginTransaction())
            {
                var original = _context.RoleLevelAdvancePermissions.Where(x => x.RoleLevelId == roleLevelAdvancePermission.RoleLevelId).FirstOrDefault();
                if (original != null)
                {
                    RoleLevelAdvancePermission advancePermission = new RoleLevelAdvancePermission()
                    {
                        Id = original.Id,
                        PermissionLevelId = roleLevelAdvancePermission.PermissionLevelId,
                        RoleLevelId = roleLevelAdvancePermission.RoleLevelId
                    };
                    _context.Entry(original).CurrentValues.SetValues(advancePermission);
                }
                else
                {
                    RoleLevelAdvancePermission advancePermission = new RoleLevelAdvancePermission()
                    {
                        PermissionLevelId = roleLevelAdvancePermission.PermissionLevelId,
                        RoleLevelId = roleLevelAdvancePermission.RoleLevelId
                    };
                    _context.RoleLevelAdvancePermissions.Add(advancePermission);
                }
                result = _context.SaveChanges();
                if (result > 0)
                {
                    ContextTransaction.Commit();
                }
                else
                {
                    ContextTransaction.Rollback();
                }
            }
            return result;
        }

        public List<IpsPermissionLevelModel> GetAllermissionLevels()
        {
            return _context.PermissionLevels.Select(x => new IpsPermissionLevelModel()
            {
                Id = x.Id,
                Name = x.Name,
            }).ToList();
        }

    }
}
