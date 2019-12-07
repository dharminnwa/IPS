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


namespace IPS.Business
{
    public class TaskStatusService : BaseService, IPS.Business.ITaskStatusService
    {
        public IQueryable<IPS.Data.TaskStatusListItem> GetTaskStatusListByUserId(int Id)
        {
            int taskStatusListId = _ipsDataContext.TaskLists.Where(tl => tl.UserId == Id).Select(tl => tl.TaskStatusListId).FirstOrDefault();
            return _ipsDataContext.TaskStatusListItems.Where(t => t.TaskStatusListId == taskStatusListId).AsNoTracking().AsQueryable();
        }


       /* public IQueryable<IPS.Data.Task> GetTasksListById(int taskId)
        {
            return _ipsDataContext.Tasks.Where(t => t.Id == taskId).AsNoTracking().AsQueryable();
        }

        
        public IPS.Data.Task Add(IPS.Data.Task task)
        {
            TaskList tasklist = _ipsDataContext.TaskLists.Where(tl => tl.Id == task.TaskListId && tl.UserId == task.UserId).FirstOrDefault();
            TaskList newTasklist = new TaskList();

            if (tasklist == null)
            {

                User user = _ipsDataContext.Users.Where(u => u.Id == task.UserId).FirstOrDefault();
                
                newTasklist.Name = user.FirstName + '.' + user.LastName + "TaskList";
                
                

                newTasklist.TaskStatusListId = _ipsDataContext.TaskStatusLists.Select(tsl => tsl.Id).FirstOrDefault();
                newTasklist.TaskPriorityListId = _ipsDataContext.TaskPriorityLists.Select(tpl => tpl.Id).FirstOrDefault();
                newTasklist.UserId = task.UserId;
                task.TaskListId = newTasklist.Id;
                _ipsDataContext.TaskLists.Add(newTasklist);
            }
            
            task.TaskCategoryListItem = null;
            task.TaskList = null;
            task.TaskPriorityListItem = null;
            task.Tasks1 = null;
            task.Task1 = null;
            task.TaskStatusList = null;
                

            _ipsDataContext.Tasks.Add(task);

            _ipsDataContext.SaveChanges();
            
            return task;
        }


        public void Update(IPS.Data.Task task)
        {

            var original = _ipsDataContext.Tasks.Find(task.Id);

            if (original != null)
            {
                task.TaskCategoryListItem = null;
                task.TaskList = null;
                task.TaskPriorityListItem = null;
                task.Tasks1 = null;
                task.Task1 = null;
                task.TaskStatusList = null;

                _ipsDataContext.Entry(original).CurrentValues.SetValues(task);
                _ipsDataContext.SaveChanges();
            }

        }

        public void Delete(IPS.Data.Task task)
        {
            IPS.Data.Task original = _ipsDataContext.Tasks.Where(t => t.Id == task.Id).FirstOrDefault();

            if (original != null)
            {

                _ipsDataContext.Tasks.Remove(original);
                _ipsDataContext.SaveChanges();
            }
        }
        */
         
    }
}
