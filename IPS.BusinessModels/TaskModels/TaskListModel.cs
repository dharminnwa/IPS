using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TaskModels
{
    public class TaskListModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int TaskStatusListId { get; set; }
        public int TaskPriorityListId { get; set; }
        public Nullable<int> TaskCategoryListsId { get; set; }
    }
}
