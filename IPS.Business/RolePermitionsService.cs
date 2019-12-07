using IPS.AuthData.Models;
using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IPS.BusinessModels.ResourceModels;
using IPS.BusinessModels.Enum;

namespace IPS.Business
{
    public class RolePermitionsService : IRolePermitionsService
    {
        private ApplicationDbContext _context;


        public RolePermitionsService()
        {
            _context = ApplicationDbContext.Create("IdentityConnection");
        }

        public IQueryable<IpsRolePermission> GetByRoleId(string roleId)
        {
            List<Resource> resources = _context.Resources.ToList();
            List<IpsRolePermission> result = new List<IpsRolePermission>();
            int roleLevel = _context.Roles.Where(x => x.Id == roleId).Select(x => x.RoleLevel).FirstOrDefault();
            List<IpsRoleLevelResourcesPermissionModel> roleLevelPermissions = new List<IpsRoleLevelResourcesPermissionModel>();
            if (roleLevel > 0)
            {
                RoleLevelPermissionService roleLevelPermissionServices = new RoleLevelPermissionService();
                roleLevelPermissions = roleLevelPermissionServices.GetPermissionsByLevelId(roleLevel);
            }
            foreach (Resource resource in resources)
            {
                IpsRolePermission ipsRolePermission = (from pr in _context.RolePermissions
                                                       where pr.RoleId == roleId && pr.ResourceId == resource.Id &&
                                                       pr.IsApplicableToOwnResources == true
                                                       select new IpsRolePermission
                                                       {
                                                           RoleId = roleId,
                                                           ResourceId = pr.ResourceId,
                                                           ResourseName = resource.Name,
                                                           IsRead = ((Operations)pr.Operations).HasFlag(Operations.Read),
                                                           IsUpdate = ((Operations)pr.Operations).HasFlag(Operations.Update),
                                                           IsCreate = ((Operations)pr.Operations).HasFlag(Operations.Create),
                                                           IsDelete = ((Operations)pr.Operations).HasFlag(Operations.Delete),
                                                           IsApplicableToOwnResources = pr.IsApplicableToOwnResources
                                                       }).FirstOrDefault();
                if (ipsRolePermission == null)
                {

                    if (roleLevel > 0)
                    {

                        List<IpsRoleLevelResourcesPermissionModel> roleLevelResourcePermissions = roleLevelPermissions.Where(pr => pr.RoleLevelId == roleLevel && pr.ResourceId == resource.Id).ToList();
                        if (roleLevelResourcePermissions.Count > 0)
                        {
                            ipsRolePermission = new IpsRolePermission();
                            ipsRolePermission.RoleId = roleId;
                            ipsRolePermission.ResourceId = resource.Id;
                            ipsRolePermission.ResourseName = resource.Name;
                            ipsRolePermission.IsApplicableToOwnResources = true;
                            ipsRolePermission.IsCreate = roleLevelResourcePermissions.Any(x => x.OperationId == (int)OperationEnum.Create);
                            ipsRolePermission.IsRead = roleLevelResourcePermissions.Any(x => x.OperationId == (int)OperationEnum.Read);
                            ipsRolePermission.IsUpdate = roleLevelResourcePermissions.Any(x => x.OperationId == (int)OperationEnum.Update);
                            ipsRolePermission.IsDelete = roleLevelResourcePermissions.Any(x => x.OperationId == (int)OperationEnum.Delete);
                        }
                        else
                        {
                            ipsRolePermission = new IpsRolePermission();
                            ipsRolePermission.RoleId = roleId;
                            ipsRolePermission.ResourceId = resource.Id;
                            ipsRolePermission.ResourseName = resource.Name;
                            ipsRolePermission.IsApplicableToOwnResources = true;
                        }   
                    }
                    else
                    {
                        ipsRolePermission = new IpsRolePermission();
                        ipsRolePermission.RoleId = roleId;
                        ipsRolePermission.ResourceId = resource.Id;
                        ipsRolePermission.ResourseName = resource.Name;
                        ipsRolePermission.IsApplicableToOwnResources = true;
                    }
                }



                result.Add(ipsRolePermission);
            }

            foreach (Resource resource in resources)
            {
                IpsRolePermission ipsRolePermission = (from pr in _context.RolePermissions
                                                       where pr.RoleId == roleId && pr.ResourceId == resource.Id &&
                                                       pr.IsApplicableToOwnResources == false
                                                       select new IpsRolePermission
                                                       {
                                                           RoleId = roleId,
                                                           ResourceId = pr.ResourceId,
                                                           ResourseName = resource.Name,
                                                           IsRead = ((Operations)pr.Operations).HasFlag(Operations.Read),
                                                           IsUpdate = ((Operations)pr.Operations).HasFlag(Operations.Update),
                                                           IsCreate = ((Operations)pr.Operations).HasFlag(Operations.Create),
                                                           IsDelete = ((Operations)pr.Operations).HasFlag(Operations.Delete),
                                                           IsApplicableToOwnResources = pr.IsApplicableToOwnResources
                                                       }).FirstOrDefault();
                if (ipsRolePermission == null)
                {
                    ipsRolePermission = new IpsRolePermission();
                    ipsRolePermission.RoleId = roleId;
                    ipsRolePermission.ResourceId = resource.Id;
                    ipsRolePermission.ResourseName = resource.Name;
                    ipsRolePermission.IsApplicableToOwnResources = false;
                }


                result.Add(ipsRolePermission);
            }


            return result.AsQueryable();
        }

        public RolePermission GetById(int id)
        {
            return _context.RolePermissions.Find(id);
        }

        public bool Update(List<IpsRolePermission> rolePermissions)
        {
            foreach (IpsRolePermission ipsRolePermission in rolePermissions)
            {
                RolePermission rolePermission = _context.RolePermissions.Where(rp => rp.RoleId == ipsRolePermission.RoleId && rp.ResourceId == ipsRolePermission.ResourceId && rp.IsApplicableToOwnResources == ipsRolePermission.IsApplicableToOwnResources).FirstOrDefault();
                if (rolePermission == null)
                {
                    rolePermission = new RolePermission();
                    rolePermission.RoleId = ipsRolePermission.RoleId;
                    rolePermission.ResourceId = ipsRolePermission.ResourceId;
                    rolePermission.IsApplicableToOwnResources = ipsRolePermission.IsApplicableToOwnResources;
                    rolePermission.IsApplicableToAllResources = ipsRolePermission.IsApplicableToAllResources;
                    rolePermission.Id = -1;
                    _context.RolePermissions.Add(rolePermission);

                }
                rolePermission.Operations = getOperations(ipsRolePermission);
            }

            return _context.SaveChanges() > 0;
        }

        private Operations getOperations(IpsRolePermission ipsRolePermission)
        {
            Operations operations = new Operations();

            if (ipsRolePermission.IsRead)
            {
                operations |= Operations.Read;
            }
            else
            {
                operations &= ~Operations.Read;
            }

            if (ipsRolePermission.IsCreate)
            {
                operations |= Operations.Create;
            }
            else
            {
                operations &= ~Operations.Create;
            }

            if (ipsRolePermission.IsUpdate)
            {
                operations |= Operations.Update;
            }
            else
            {
                operations &= ~Operations.Update;
            }

            if (ipsRolePermission.IsDelete)
            {
                operations |= Operations.Delete;
            }
            else
            {
                operations &= ~Operations.Delete;
            }

            return operations;
        }



        public IQueryable<OrganisationResourcePermission> GetByOrganisationRoleId(string roleId)
        {
            List<Resource> resources = _context.Resources.ToList();
            List<OrganisationResourcePermission> result = new List<OrganisationResourcePermission>();
            foreach (Resource resource in resources)
            {
                OrganisationResourcePermission ipsRolePermission = (from pr in _context.RolePermissions
                                                                    where pr.RoleId == roleId && pr.ResourceId == resource.Id &&
                                                                    pr.IsApplicableToOwnResources == true
                                                                    select new OrganisationResourcePermission
                                                                    {
                                                                        RoleId = roleId,
                                                                        ResourceId = pr.ResourceId,
                                                                        ResourseName = resource.Name,
                                                                        IsRead = ((Operations)pr.Operations).HasFlag(Operations.Read),
                                                                        IsUpdate = ((Operations)pr.Operations).HasFlag(Operations.Update),
                                                                        IsCreate = ((Operations)pr.Operations).HasFlag(Operations.Create),
                                                                        IsDelete = ((Operations)pr.Operations).HasFlag(Operations.Delete),
                                                                        IsApplicableToOwnResources = pr.IsApplicableToOwnResources
                                                                    }).FirstOrDefault();
                if (ipsRolePermission == null)
                {
                    ipsRolePermission = new OrganisationResourcePermission();
                    ipsRolePermission.RoleId = roleId;
                    ipsRolePermission.ResourceId = resource.Id;
                    ipsRolePermission.ResourseName = resource.Name;
                    ipsRolePermission.IsApplicableToOwnResources = true;
                }

                result.Add(ipsRolePermission);
            }

            foreach (Resource resource in resources)
            {
                OrganisationResourcePermission ipsRolePermission = (from pr in _context.RolePermissions
                                                                    where pr.RoleId == roleId && pr.ResourceId == resource.Id &&
                                                                    pr.IsApplicableToOwnResources == false
                                                                    select new OrganisationResourcePermission
                                                                    {
                                                                        RoleId = roleId,
                                                                        ResourceId = pr.ResourceId,
                                                                        ResourseName = resource.Name,
                                                                        IsRead = ((Operations)pr.Operations).HasFlag(Operations.Read),
                                                                        IsUpdate = ((Operations)pr.Operations).HasFlag(Operations.Update),
                                                                        IsCreate = ((Operations)pr.Operations).HasFlag(Operations.Create),
                                                                        IsDelete = ((Operations)pr.Operations).HasFlag(Operations.Delete),
                                                                        IsApplicableToOwnResources = pr.IsApplicableToOwnResources
                                                                    }).FirstOrDefault();
                if (ipsRolePermission == null)
                {
                    ipsRolePermission = new OrganisationResourcePermission();
                    ipsRolePermission.RoleId = roleId;
                    ipsRolePermission.ResourceId = resource.Id;
                    ipsRolePermission.ResourseName = resource.Name;
                    ipsRolePermission.IsApplicableToOwnResources = false;
                }

                result.Add(ipsRolePermission);
            }

            return result.AsQueryable();
        }

        public RoleOrganisationPermission GetOrganisationPermissionById(int id)
        {
            return _context.RoleOrganisationPermissions.Find(id);
        }

        public bool UpdateOrganisationPermission(List<OrganisationResourcePermission> OrganisationPermissions)
        {
            foreach (OrganisationResourcePermission ipsRolePermission in OrganisationPermissions)
            {
                RolePermission rolePermission = _context.RolePermissions.Where(rp => rp.RoleId == ipsRolePermission.RoleId && rp.ResourceId == ipsRolePermission.ResourceId && rp.IsApplicableToOwnResources == ipsRolePermission.IsApplicableToOwnResources).FirstOrDefault();
                if (rolePermission == null)
                {
                    rolePermission = new RolePermission();
                    rolePermission.RoleId = ipsRolePermission.RoleId;
                    rolePermission.ResourceId = ipsRolePermission.ResourceId;
                    rolePermission.IsApplicableToOwnResources = ipsRolePermission.IsApplicableToOwnResources;
                    rolePermission.IsApplicableToAllResources = ipsRolePermission.IsApplicableToAllResources;
                    rolePermission.Id = -1;
                    _context.RolePermissions.Add(rolePermission);

                }
                rolePermission.Operations = getOrganisationOperations(ipsRolePermission);
            }

            return _context.SaveChanges() > 0;
        }

        private Operations getOrganisationOperations(OrganisationResourcePermission ipsRolePermission)
        {
            Operations operations = new Operations();

            if (ipsRolePermission.IsRead)
            {
                operations |= Operations.Read;
            }
            else
            {
                operations &= ~Operations.Read;
            }

            if (ipsRolePermission.IsCreate)
            {
                operations |= Operations.Create;
            }
            else
            {
                operations &= ~Operations.Create;
            }

            if (ipsRolePermission.IsUpdate)
            {
                operations |= Operations.Update;
            }
            else
            {
                operations &= ~Operations.Update;
            }

            if (ipsRolePermission.IsDelete)
            {
                operations |= Operations.Delete;
            }
            else
            {
                operations &= ~Operations.Delete;
            }

            return operations;
        }
    }
}
