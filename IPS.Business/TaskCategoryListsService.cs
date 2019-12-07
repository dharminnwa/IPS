using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Collections;
using IPS.Business.Interfaces;


namespace IPS.Business
{
    public class TaskCategoryListsService : BaseService, ITaskCategoryListsService
    {
        public IQueryable<IPS.Data.TaskCategoryList> Get()
        {
            return _ipsDataContext.TaskCategoryLists.AsNoTracking().AsQueryable();
        }

        public IQueryable<IPS.Data.TaskCategoryList> Get(int organizationId, int? departmentId, int? teamId, int? userId)
        {
            IQueryable<IPS.Data.TaskCategoryList> result = null;

            if ((userId != null) && (_ipsDataContext.TaskCategoryLists.Where(tp => tp.UserId  == userId).Count() > 0))
            {
                result = _ipsDataContext.TaskCategoryLists.Include("TaskCategoryListItems").Where(tp => tp.OrganizationId == organizationId && tp.UserId == userId).AsNoTracking().AsQueryable();
            } 
            else if ((teamId != null) && (_ipsDataContext.TaskCategoryLists.Where(tp => tp.TeamId == teamId).Count() > 0)) {
                result = _ipsDataContext.TaskCategoryLists.Include("TaskCategoryListItems").Where(tp => tp.OrganizationId == organizationId && tp.TeamId == teamId).AsNoTracking().AsQueryable();
            }
            else if ((departmentId != null) && (_ipsDataContext.TaskCategoryLists.Where(tp => tp.DepartmentId == departmentId).Count() > 0))
            {
                result = _ipsDataContext.TaskCategoryLists.Include("TaskCategoryListItems").Where(tp => tp.OrganizationId == organizationId && tp.DepartmentId == departmentId).AsNoTracking().AsQueryable();
            } 
            else if (_ipsDataContext.TaskCategoryLists.Any(tp => tp.OrganizationId == organizationId)) {
                result = _ipsDataContext.TaskCategoryLists.Include("TaskCategoryListItems").Where(tp => tp.OrganizationId == organizationId && tp.DepartmentId == null && tp.TeamId == null && tp.UserId == null).AsNoTracking().AsQueryable();
            }

            return result;
        }

        public IQueryable<IPS.Data.TaskCategoryList> GetUserlist(int userId) {
            IQueryable<IPS.Data.TaskCategoryList> result = null;

            if (_ipsDataContext.TaskCategoryLists.Where(tp => tp.UserId == userId).Count() > 0)
            {
                result = _ipsDataContext.TaskCategoryLists.Include("TaskCategoryListItems").Where(tp =>tp.UserId == userId).AsNoTracking().AsQueryable();
            }

            if (result == null)
            {

                UserService userService = new UserService();

                User user = _ipsDataContext.Users.Where(u=>u.Id == userId).Include("Departments").Include("Departments1").Include("Teams").FirstOrDefault();

                int? depId = null;
                Department dep = user.Departments.FirstOrDefault();
            
                if(dep == null)
                {
                    dep = user.Departments1.FirstOrDefault();
                }
            
                if(dep != null){
                    depId = dep.Id;
                }
            
                int? teamId = null;
                Team team = user.Teams.FirstOrDefault();
                if(team != null){
                    teamId = team.Id;
                }

                int orgId  = user.OrganizationId.HasValue ? user.OrganizationId.Value : 0;

                int listId;
                IQueryable<TaskCategoryList> list = Get(orgId, depId, teamId, userId);
                if (list == null || !list.Any())
                {
                    listId = CreateFromDefaultTemplate(orgId, depId, teamId, userId);
                }
                else
                {
                    listId = CreateFromTemplate(list.First(), orgId, depId, teamId, userId);
                }
                result = GetTasksListById(listId);
            }

            return result;
        }

        public int CreateFromDefaultTemplate(int organizationId, int? departmentId, int? teamId, int? userId)
        {
            TaskCategoryList taskCategoryListTemplate = _ipsDataContext.TaskCategoryLists.Include("TaskCategoryListItems").Where(tp => tp.IsTemplate == true).AsNoTracking().FirstOrDefault();
            return CreateFromTemplate(taskCategoryListTemplate, organizationId, departmentId, teamId, userId);
        }

        public int CreateFromTemplate(TaskCategoryList taskCategoryListTemplate, int organizationId, int? departmentId, int? teamId, int? userId)
        {
            TaskCategoryList taskCategoryList = new TaskCategoryList();

            if (userId != null)
            {
                taskCategoryList.OrganizationId = organizationId;
                taskCategoryList.DepartmentId = null;
                taskCategoryList.TeamId = null;
                taskCategoryList.UserId = userId;
                
            }
            else if (teamId != null)
            {
                taskCategoryList.OrganizationId = organizationId;
                taskCategoryList.DepartmentId = null;
                taskCategoryList.TeamId = teamId;
                taskCategoryList.UserId = null;
            }
            else if (teamId != null)
            {
                taskCategoryList.OrganizationId = organizationId;
                taskCategoryList.DepartmentId = departmentId;
                taskCategoryList.TeamId = null;
                taskCategoryList.UserId = null;
            }
            else 
            {
                taskCategoryList.OrganizationId = organizationId;
                taskCategoryList.DepartmentId = null;
                taskCategoryList.TeamId = null;
                taskCategoryList.UserId = null;
            }

            taskCategoryList.Name = taskCategoryListTemplate.Name;
            taskCategoryList.Description = taskCategoryListTemplate.Description;
            _ipsDataContext.TaskCategoryLists.Add(taskCategoryList);

            foreach (TaskCategoryListItem itemTemplate in taskCategoryListTemplate.TaskCategoryListItems)
            {
                TaskCategoryListItem item = new TaskCategoryListItem();
                item.Name = itemTemplate.Name;
                item.Description = itemTemplate.Description;
                item.Color = itemTemplate.Color;
                item.TextColor = itemTemplate.TextColor;
                item.CategoryListId = taskCategoryList.Id;
                _ipsDataContext.TaskCategoryListItems.Add(item);
            }

            _ipsDataContext.SaveChanges();

            return taskCategoryList.Id;
        } 

        public IQueryable<IPS.Data.TaskCategoryList> GetTasksListById(int id)
        {
            return _ipsDataContext.TaskCategoryLists.Where(t => t.Id == id).AsNoTracking().AsQueryable();
        }


        public TaskCategoryList Add(TaskCategoryList item)
        {
            TaskCategoryList TaskCategoryList = _ipsDataContext.TaskCategoryLists.Where(t => t.Id == item.Id).FirstOrDefault();

            if (TaskCategoryList == null)
            {
                _ipsDataContext.TaskCategoryLists.Add(item);
                _ipsDataContext.SaveChanges();
            }

            return item;
        }


        public void Update(TaskCategoryList item)
        {

            var original = _ipsDataContext.TaskCategoryLists.Find(item.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(item);
                _ipsDataContext.SaveChanges();
            }

        }

        public void Delete(TaskCategoryList item)
        {
            TaskCategoryList original = _ipsDataContext.TaskCategoryLists.Where(t => t.Id == item.Id).FirstOrDefault();

            if (original != null)
            {
                _ipsDataContext.TaskCategoryLists.Remove(original);
                _ipsDataContext.SaveChanges();
            }
        }
        
         
    }
}
