using IPS.AuthData;
using IPS.AuthData.Models;
using IPS.Business.Interfaces;
using IPS.BusinessModels.ResourceModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class RoleLevelPermissionTemplateService : IRoleLevelPermissionTemplateService
    {
        private ApplicationDbContext _context;
        public RoleLevelPermissionTemplateService()
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

        public int Add(IpsPermissionTemplatesModel IpsPermissionTemplatesModel)
        {
            int result = 0;
            using (var ContextTransaction = _context.Database.BeginTransaction())
            {
                PermissionTemplates permissionTemplate = new PermissionTemplates()
                {
                    Id = IpsPermissionTemplatesModel.Id,
                    Name = IpsPermissionTemplatesModel.Name,
                };
                _context.PermissionTemplates.Add(permissionTemplate);
                _context.SaveChanges();

                List<PermissionTemplateResources> permissionTemplateResources = IpsPermissionTemplatesModel.ResourcePermissions.Select(x => new PermissionTemplateResources()
                {
                    OperationId = x.OperationId,
                    ResourceId = x.ResourceId,
                    PermissionTemplateId = permissionTemplate.Id
                }).ToList();

                _context.PermissionTemplateResources.AddRange(permissionTemplateResources);
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

        public int Update(IpsPermissionTemplatesModel IpsPermissionTemplatesModel)
        {
            int result = 0;
            using (var ContextTransaction = _context.Database.BeginTransaction())
            {
                List<PermissionTemplateResources> oldPermissionTemplateResources = _context.PermissionTemplateResources.Where(x => x.PermissionTemplateId == IpsPermissionTemplatesModel.Id).ToList();
                //Remove Old Permissions
                _context.PermissionTemplateResources.RemoveRange(oldPermissionTemplateResources);
                _context.SaveChanges();
                //Update PermissionTemplates 
                PermissionTemplates permissionTemplate = new PermissionTemplates()
                {
                    Id = IpsPermissionTemplatesModel.Id,
                    Name = IpsPermissionTemplatesModel.Name,
                };

                PermissionTemplates original = _context.PermissionTemplates.Find(IpsPermissionTemplatesModel.Id);

                if (original != null)
                {
                    _context.Entry(original).CurrentValues.SetValues(permissionTemplate);
                    _context.SaveChanges();

                    // Add New Permissions
                    List<PermissionTemplateResources> permissionTemplateResources = IpsPermissionTemplatesModel.ResourcePermissions.Select(x => new PermissionTemplateResources()
                    {
                        OperationId = x.OperationId,
                        ResourceId = x.ResourceId,
                        PermissionTemplateId = IpsPermissionTemplatesModel.Id
                    }).ToList();

                    _context.PermissionTemplateResources.AddRange(permissionTemplateResources);
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

                // _context.SaveChanges();


            }
            return result;
        }
        public IpsPermissionTemplatesModel GetPermissionTemplateById(int permissionTemplateById)
        {
            IpsPermissionTemplatesModel ipsPermissionTemplatesModel = new IpsPermissionTemplatesModel();
            ipsPermissionTemplatesModel = _context.PermissionTemplates.Where(x => x.Id == permissionTemplateById).Select(p => new IpsPermissionTemplatesModel()
            {
                Id = p.Id,
                Name = p.Name,
            }).FirstOrDefault();
            if (ipsPermissionTemplatesModel != null)
            {
                ipsPermissionTemplatesModel.ResourcePermissions = _context.PermissionTemplateResources.Where(x => x.PermissionTemplateId == ipsPermissionTemplatesModel.Id).Select(p => new IpsPermissionTemplateResourcesModel()
                {
                    Id = p.Id,
                    OperationId = p.OperationId,
                    PermissionTemplateId = p.PermissionTemplateId,
                    ResourceId = p.ResourceId
                }).ToList();
            }
            return ipsPermissionTemplatesModel;
        }

        public List<IpsPermissionTemplatesModel> GetPermissionTemplates()
        {
            return _context.PermissionTemplates.Select(p => new IpsPermissionTemplatesModel()
            {
                Id = p.Id,
                Name = p.Name,
            }).ToList();
        }

    }
}
