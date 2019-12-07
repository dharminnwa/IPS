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
    public class TaskPriorityListItemsService : BaseService, ITaskPriorityListItemsService
    {
        //public IQueryable<IPS.Data.TaskPriorityListItem> GetTaskPriorityListByUserId(int Id)
        //{
        //    int taskPriorityListId = _ipsDataContext.TaskLists.Where(tl => tl.UserId == Id).Select(tl => tl.TaskPriorityListId).FirstOrDefault();
        //    return _ipsDataContext.TaskPriorityListItems.Where(t => t.PriorityListId == taskPriorityListId).AsNoTracking().AsQueryable();
        //}

        public IQueryable<IPS.Data.TaskPriorityListItem> Get()
        {
            return _ipsDataContext.TaskPriorityListItems.AsNoTracking().AsQueryable();
        }

        public IQueryable<IPS.Data.TaskPriorityListItem> GetTasksListById(int id)
        {
            return _ipsDataContext.TaskPriorityListItems.Where(t => t.Id == id).AsNoTracking().AsQueryable();
        }


        public TaskPriorityListItem Add(TaskPriorityListItem item)
        {
            TaskPriorityListItem taskPriorityList = _ipsDataContext.TaskPriorityListItems.Where(t => t.Id == item.Id).FirstOrDefault();

            if (taskPriorityList == null)
            {
                _ipsDataContext.TaskPriorityListItems.Add(item);
                _ipsDataContext.SaveChanges();
            }

            return item;
        }


        public void Update(TaskPriorityListItem item)
        {

            var original = _ipsDataContext.TaskPriorityListItems.Find(item.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(item);
                _ipsDataContext.SaveChanges();
            }

        }

        public void Delete(TaskPriorityListItem item)
        {
            TaskPriorityListItem original = _ipsDataContext.TaskPriorityListItems.Where(t => t.Id == item.Id).FirstOrDefault();

            if (original != null)
            {
                _ipsDataContext.TaskPriorityListItems.Remove(original);
                _ipsDataContext.SaveChanges();
            }
        }

        public List<TaskPriorityListItemModel> GetTaskPriorityListItemsByPriorityListId(int priorityListId)
        {
            return _ipsDataContext.TaskPriorityListItems.Where(t => t.PriorityListId == priorityListId).Select(x => new TaskPriorityListItemModel
            {
                Id = x.Id,
                Name = x.Name
            }).OrderBy(x => x.Name).ToList();
        }


    }
}
