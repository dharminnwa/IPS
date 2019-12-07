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
    public class TaskPriorityListsService : BaseService, ITaskPriorityListsService
    {
        public IQueryable<IPS.Data.TaskPriorityList> Get()
        {
            return _ipsDataContext.TaskPriorityLists.AsNoTracking().AsQueryable();
        }

        public IQueryable<IPS.Data.TaskPriorityList> Get(int organizationId, int? departmentId, int? teamId, int? userId)
        {
            IQueryable<IPS.Data.TaskPriorityList> result = null;

            if ((userId != null) && (_ipsDataContext.TaskPriorityLists.Where(tp => tp.UserId == userId).Count() > 0))
            {
                result = _ipsDataContext.TaskPriorityLists.Include("TaskPriorityListItems").Where(tp => tp.UserId == userId).AsNoTracking().AsQueryable();
            }
            else if ((teamId != null) && (_ipsDataContext.TaskPriorityLists.Where(tp => tp.OrganizationId == organizationId && tp.TeamId == teamId).Count() > 0))
            {
                result = _ipsDataContext.TaskPriorityLists.Include("TaskPriorityListItems").Where(tp => tp.TeamId == teamId).AsNoTracking().AsQueryable();
            }
            else if ((departmentId != null) && (_ipsDataContext.TaskPriorityLists.Where(tp => tp.OrganizationId == organizationId && tp.DepartmentId == departmentId).Count() > 0))
            {
                result = _ipsDataContext.TaskPriorityLists.Include("TaskPriorityListItems").Where(tp => tp.OrganizationId == organizationId && tp.DepartmentId == departmentId).AsNoTracking().AsQueryable();
            }
            else if (_ipsDataContext.TaskPriorityLists.Where(tp => tp.OrganizationId == organizationId).Count() > 0)
            {
                result = _ipsDataContext.TaskPriorityLists.Include("TaskPriorityListItems").Where(tp => tp.OrganizationId == organizationId && tp.DepartmentId == null && tp.TeamId == null && tp.UserId == null).AsNoTracking().AsQueryable();
            }

            return result;
        }

        public IQueryable<IPS.Data.TaskPriorityList> GetUserlist(int userId)
        {
            IQueryable<IPS.Data.TaskPriorityList> result = null;

            if (_ipsDataContext.TaskPriorityLists.Where(tp => tp.UserId == userId).Count() > 0)
            {
                result = _ipsDataContext.TaskPriorityLists.Include("TaskPriorityListItems").Where(tp => tp.UserId == userId).AsNoTracking().AsQueryable();
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
                IQueryable<TaskPriorityList> list = Get(orgId, depId, teamId, userId);                    
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
            TaskPriorityList taskPriorityListTemplate = _ipsDataContext.TaskPriorityLists.Include("TaskPriorityListItems").Where(tp => tp.IsTemplate == true).AsNoTracking().FirstOrDefault();
            return CreateFromTemplate(taskPriorityListTemplate, organizationId, departmentId, teamId, userId);
        }

        public int CreateFromTemplate(TaskPriorityList taskPriorityListTemplate, int organizationId, int? departmentId, int? teamId, int? userId)
        {
            TaskPriorityList taskPriorityList = new TaskPriorityList();

            if (userId != null)
            {
                taskPriorityList.OrganizationId = organizationId;
                taskPriorityList.DepartmentId = null;
                taskPriorityList.TeamId = null;
                taskPriorityList.UserId = userId;

            }
            else if (teamId != null)
            {
                taskPriorityList.OrganizationId = organizationId;
                taskPriorityList.DepartmentId = null;
                taskPriorityList.TeamId = teamId;
                taskPriorityList.UserId = null;
            }
            else if (teamId != null)
            {
                taskPriorityList.OrganizationId = organizationId;
                taskPriorityList.DepartmentId = departmentId;
                taskPriorityList.TeamId = null;
                taskPriorityList.UserId = null;
            }
            else 
            {
                taskPriorityList.OrganizationId = organizationId;
                taskPriorityList.DepartmentId = null;
                taskPriorityList.TeamId = null;
                taskPriorityList.UserId = null;
            }

            taskPriorityList.Name = taskPriorityListTemplate.Name;
            taskPriorityList.Description = taskPriorityListTemplate.Description;
            _ipsDataContext.TaskPriorityLists.Add(taskPriorityList);

            foreach (TaskPriorityListItem itemTemplate in taskPriorityListTemplate.TaskPriorityListItems)
            {
                TaskPriorityListItem item = new TaskPriorityListItem();
                item.Name = itemTemplate.Name;
                item.Description = itemTemplate.Description;
                item.PriorityListId = taskPriorityList.Id;
                _ipsDataContext.TaskPriorityListItems.Add(item);
            }

            _ipsDataContext.SaveChanges();

            return taskPriorityList.Id;
        }

        public IQueryable<IPS.Data.TaskPriorityList> GetTasksListById(int id)
        {
            return _ipsDataContext.TaskPriorityLists.Where(t => t.Id == id).AsNoTracking().AsQueryable();
        }


        public TaskPriorityList Add(TaskPriorityList item)
        {
            TaskPriorityList taskPriorityList = _ipsDataContext.TaskPriorityLists.Where(t => t.Id == item.Id).FirstOrDefault();

            if (taskPriorityList == null)
            {
                _ipsDataContext.TaskPriorityLists.Add(item);
                _ipsDataContext.SaveChanges();
            }

            return item;
        }

        public void Update(TaskPriorityList item)
        {

            var original = _ipsDataContext.TaskPriorityLists.Find(item.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(item);
                _ipsDataContext.SaveChanges();
            }

        }

        public void Delete(TaskPriorityList item)
        {
            TaskPriorityList original = _ipsDataContext.TaskPriorityLists.Where(t => t.Id == item.Id).FirstOrDefault();

            if (original != null)
            {
                _ipsDataContext.TaskPriorityLists.Remove(original);
                _ipsDataContext.SaveChanges();
            }
        }
        
         
    }
}
