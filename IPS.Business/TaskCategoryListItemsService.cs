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
    public class TaskCategoryListItemsService : BaseService, ITaskCategoryListItemsService
    {
        //public IQueryable<IPS.Data.TaskPriorityListItem> GetTaskPriorityListByUserId(int Id)
        //{
        //    int taskPriorityListId = _ipsDataContext.TaskLists.Where(tl => tl.UserId == Id).Select(tl => tl.TaskPriorityListId).FirstOrDefault();
        //    return _ipsDataContext.TaskPriorityListItems.Where(t => t.PriorityListId == taskPriorityListId).AsNoTracking().AsQueryable();
        //}

        public IQueryable<IPS.Data.TaskCategoryListItem> Get()
        {
            return _ipsDataContext.TaskCategoryListItems.AsNoTracking().AsQueryable();
        }

        public IQueryable<IPS.Data.TaskCategoryListItem> GetTasksListById(int id)
        {
            return _ipsDataContext.TaskCategoryListItems.Where(t => t.Id == id).AsNoTracking().AsQueryable();
        }

        public List<TaskCategoriesListItemModel> GetCategoriesListItemsByCategoriesListId(int categoriesListId)
        {
            return _ipsDataContext.TaskCategoryListItems.Where(t => t.CategoryListId == categoriesListId).Select(x => new TaskCategoriesListItemModel
            {
                CategoryListId = x.CategoryListId,
                Color = x.Color,
                Description = x.Description,
                Id = x.Id,
                Name = x.Name,
                TextColor = x.TextColor
            }).OrderBy(x=>x.Name).ToList();
        }


        public TaskCategoryListItem Add(TaskCategoryListItem item)
        {
            TaskCategoryListItem taskPriorityList = _ipsDataContext.TaskCategoryListItems.Where(t => t.Id == item.Id).FirstOrDefault();

            if (taskPriorityList == null)
            {
                _ipsDataContext.TaskCategoryListItems.Add(item);
                _ipsDataContext.SaveChanges();
            }

            return item;
        }


        public void Update(TaskCategoryListItem item)
        {

            var original = _ipsDataContext.TaskCategoryListItems.Find(item.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(item);
                _ipsDataContext.SaveChanges();
            }

        }

        public void Delete(TaskCategoryListItem item)
        {
            TaskCategoryListItem original = _ipsDataContext.TaskCategoryListItems.Where(t => t.Id == item.Id).FirstOrDefault();

            if (original != null)
            {
                _ipsDataContext.TaskCategoryListItems.Remove(original);
                _ipsDataContext.SaveChanges();
            }
        }
    }
}
