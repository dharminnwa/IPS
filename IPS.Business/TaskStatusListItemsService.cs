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
using IPS.BusinessModels.TaskModels;

namespace IPS.Business
{
    public class TaskStatusListItemsService : BaseService, ITaskStatusListItemsService
    {
        //public IQueryable<IPS.Data.TaskPriorityListItem> GetTaskPriorityListByUserId(int Id)
        //{
        //    int taskPriorityListId = _ipsDataContext.TaskLists.Where(tl => tl.UserId == Id).Select(tl => tl.TaskPriorityListId).FirstOrDefault();
        //    return _ipsDataContext.TaskPriorityListItems.Where(t => t.PriorityListId == taskPriorityListId).AsNoTracking().AsQueryable();
        //}

        public IQueryable<IPS.Data.TaskStatusListItem> Get()
        {
            return _ipsDataContext.TaskStatusListItems.AsNoTracking().AsQueryable();
        }

        public IQueryable<IPS.Data.TaskStatusListItem> GetTasksListById(int id)
        {
            return _ipsDataContext.TaskStatusListItems.Where(t => t.Id == id).AsNoTracking().AsQueryable();
        }


        public TaskStatusListItem Add(TaskStatusListItem item)
        {
            TaskStatusListItem taskPriorityList = _ipsDataContext.TaskStatusListItems.Where(t => t.Id == item.Id).FirstOrDefault();

            if (taskPriorityList == null)
            {
                _ipsDataContext.TaskStatusListItems.Add(item);
                _ipsDataContext.SaveChanges();
            }

            return item;
        }


        public void Update(TaskStatusListItem item)
        {

            var original = _ipsDataContext.TaskStatusListItems.Find(item.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(item);
                _ipsDataContext.SaveChanges();
            }

        }

        public void Delete(TaskStatusListItem item)
        {
            TaskStatusListItem original = _ipsDataContext.TaskStatusListItems.Where(t => t.Id == item.Id).FirstOrDefault();

            if (original != null)
            {
                _ipsDataContext.TaskStatusListItems.Remove(original);
                _ipsDataContext.SaveChanges();
            }
        }

        public List<TaskStatusListItemModel> GetStatusListItemsByStatusListId(int StatusListId)
        {
            return _ipsDataContext.TaskStatusListItems.Where(t => t.TaskStatusListId == StatusListId).Select(x => new TaskStatusListItemModel
            {
                Id = x.Id,
                Name = x.Name
            }).OrderBy(x => x.Name).ToList();
        }



    }
}
