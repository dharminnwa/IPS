using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.ProjectModel
{
    public class IpsUserProjects
    {
        public IpsUserProjects()
        {
            ActiveProjects = new List<IpsUserProjectListModel>();
            CompletedProjects = new List<IpsUserProjectListModel>();
            HistoryProjects = new List<IpsUserProjectListModel>();
            ExpiredProjects = new List<IpsUserProjectListModel>();
            PendingProjects = new List<IpsUserProjectListModel>();
        }
        public List<IpsUserProjectListModel> ActiveProjects { get; set; }
        public List<IpsUserProjectListModel> ExpiredProjects { get; set; }
        public List<IpsUserProjectListModel> CompletedProjects { get; set; }
        public List<IpsUserProjectListModel> HistoryProjects { get; set; }
        public List<IpsUserProjectListModel> PendingProjects { get; set; }

    }
}
