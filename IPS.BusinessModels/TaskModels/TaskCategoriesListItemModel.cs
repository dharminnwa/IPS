using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.TaskModels
{
  public  class TaskCategoriesListItemModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int CategoryListId { get; set; }
        public string Color { get; set; }
        public string TextColor { get; set; }
    }
}
