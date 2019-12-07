using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Data
{
    [MetadataType(typeof(TaskMetadata))]
    public partial class Task
    {
        public int UserId { get; set; }
    }

    internal class TaskMetadata
    {
        

    }
}