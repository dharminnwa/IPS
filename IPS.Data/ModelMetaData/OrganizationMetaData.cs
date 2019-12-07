using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Data
{
    [MetadataType(typeof(OrganizationMetadata))]
    public partial class Organization
    {
    }

    internal class OrganizationMetadata
    {
        [Required]
        public string Name { get; set; }


        /*[Display(Name = "Street")]
        public string Street1 { get; set; }

        [Display(Name = "Street (cont.)")]
        public string Street2 { get; set; }

        [Display(Name = "Zip code")]
        public string Zip { get; set; }*/
    }
}