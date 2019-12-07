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
    public class TaskStatusListsService : BaseService, ITaskStatusListsService
    {
        public IQueryable<IPS.Data.TaskStatusList> Get()
        {
            return _ipsDataContext.TaskStatusLists.AsNoTracking().AsQueryable();
        }

        public IQueryable<IPS.Data.TaskStatusList> Get(int organizationId, int? departmentId, int? teamId, int? userId)
        {
            IQueryable<IPS.Data.TaskStatusList> result = null;

            if ((userId != null) && (_ipsDataContext.TaskStatusLists.Where(tp => tp.UserId == userId).Count() > 0))
            {
                result = _ipsDataContext.TaskStatusLists.Include("TaskStatusListItems").Where(tp => tp.OrganizationId == organizationId && tp.UserId == userId).AsNoTracking().AsQueryable();
            }
            else if ((teamId != null) && (_ipsDataContext.TaskStatusLists.Where(tp => tp.TeamId == teamId).Count() > 0))
            {
                result = _ipsDataContext.TaskStatusLists.Include("TaskStatusListItems").Where(tp => tp.OrganizationId == organizationId && tp.TeamId == teamId).AsNoTracking().AsQueryable();
            }
            else if ((departmentId != null) && (_ipsDataContext.TaskStatusLists.Where(tp => tp.DepartmentId == departmentId).Count() > 0))
            {
                result = _ipsDataContext.TaskStatusLists.Include("TaskStatusListItems").Where(tp => tp.OrganizationId == organizationId && tp.DepartmentId == departmentId).AsNoTracking().AsQueryable();
            }
            else if (_ipsDataContext.TaskStatusLists.Where(tp => tp.OrganizationId == organizationId).Count() > 0)
            {
                result = _ipsDataContext.TaskStatusLists.Include("TaskStatusListItems").Where(tp => tp.OrganizationId == organizationId && tp.DepartmentId == null && tp.TeamId == null && tp.UserId == null).AsNoTracking().AsQueryable();
            }

            return result;
        }

        public IQueryable<IPS.Data.TaskStatusList> GetUserlist(int userId)
        {
            IQueryable<IPS.Data.TaskStatusList> result = null;

            if (_ipsDataContext.TaskStatusLists.Where(tp => tp.UserId == userId).Count() > 0)
            {
                result = _ipsDataContext.TaskStatusLists.Include("TaskStatusListItems").Where(tp => tp.UserId == userId).AsNoTracking().AsQueryable();
            }

            if (result == null)
            {

                UserService userService = new UserService();

                User user = _ipsDataContext.Users.Where(u => u.Id == userId).Include("Departments").Include("Departments1").Include("Teams").FirstOrDefault();

                int? depId = null;
                Department dep = user.Departments.FirstOrDefault();

                if (dep == null)
                {
                    dep = user.Departments1.FirstOrDefault();
                }

                if (dep != null)
                {
                    depId = dep.Id;
                }

                int? teamId = null;
                Team team = user.Teams.FirstOrDefault();
                if (team != null)
                {
                    teamId = team.Id;
                }

                int orgId = user.OrganizationId.HasValue ? user.OrganizationId.Value : 0;

                int listId;
                IQueryable<TaskStatusList> list = Get(orgId, depId, teamId, userId);
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
            TaskStatusList taskStatusListTemplate = _ipsDataContext.TaskStatusLists.Include("TaskStatusListItems").Where(tp => tp.IsTemplate == true).AsNoTracking().FirstOrDefault();
            return CreateFromTemplate(taskStatusListTemplate, organizationId, departmentId, teamId, userId);
        }

        public int CreateFromTemplate(TaskStatusList taskStatusListTemplate, int organizationId, int? departmentId, int? teamId, int? userId)
        {
            TaskStatusList taskStatusList = new TaskStatusList();

            if (userId != null)
            {
                taskStatusList.OrganizationId = organizationId;
                taskStatusList.DepartmentId = null;
                taskStatusList.TeamId = null;
                taskStatusList.UserId = userId;

            }
            else if (teamId != null)
            {
                taskStatusList.OrganizationId = organizationId;
                taskStatusList.DepartmentId = null;
                taskStatusList.TeamId = teamId;
                taskStatusList.UserId = null;
            }
            else if (teamId != null)
            {
                taskStatusList.OrganizationId = organizationId;
                taskStatusList.DepartmentId = departmentId;
                taskStatusList.TeamId = null;
                taskStatusList.UserId = null;
            }
            else 
            {
                taskStatusList.OrganizationId = organizationId;
                taskStatusList.DepartmentId = null;
                taskStatusList.TeamId = null;
                taskStatusList.UserId = null;
            }

            taskStatusList.Name = taskStatusListTemplate.Name;
            taskStatusList.Description = taskStatusListTemplate.Description;
            _ipsDataContext.TaskStatusLists.Add(taskStatusList);

            foreach (TaskStatusListItem itemTemplate in taskStatusListTemplate.TaskStatusListItems)
            {
                TaskStatusListItem item = new TaskStatusListItem();
                item.Name = itemTemplate.Name;
                item.Description = itemTemplate.Description;
                item.TaskStatusListId = taskStatusList.Id;
                _ipsDataContext.TaskStatusListItems.Add(item);
            }

            _ipsDataContext.SaveChanges();

            return taskStatusList.Id;
        }

        public IQueryable<IPS.Data.TaskStatusList> GetTasksListById(int id)
        {
            return _ipsDataContext.TaskStatusLists.Where(t => t.Id == id).AsNoTracking().AsQueryable();
        }


        public TaskStatusList Add(TaskStatusList item)
        {
            TaskStatusList TaskStatusList = _ipsDataContext.TaskStatusLists.Where(t => t.Id == item.Id).FirstOrDefault();

            if (TaskStatusList == null)
            {
                _ipsDataContext.TaskStatusLists.Add(item);
                _ipsDataContext.SaveChanges();
            }

            return item;
        }


        public void Update(TaskStatusList item)
        {

            var original = _ipsDataContext.TaskStatusLists.Find(item.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(item);
                _ipsDataContext.SaveChanges();
            }

        }

        public void Delete(TaskStatusList item)
        {
            TaskStatusList original = _ipsDataContext.TaskStatusLists.Where(t => t.Id == item.Id).FirstOrDefault();

            if (original != null)
            {
                _ipsDataContext.TaskStatusLists.Remove(original);
                _ipsDataContext.SaveChanges();
            }
        }
        
         
    }
}
