using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Data
{
    [MetadataType(typeof(IndustryMetadata))]
    public partial class Industry
    {
    }

    public class IndustryMetadata
    {
        [Required]
        [MinLength(1)]
        public string Name;

      
    }
}