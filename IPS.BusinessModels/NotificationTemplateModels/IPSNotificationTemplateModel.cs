using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.NotificationTemplateModels
{
    public class IPSNotificationTemplateModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int CultureId { get; set; }
        public string EmailSubject { get; set; }
        public string EmailBody { get; set; }
        public string SMSMessage { get; set; }
        public Nullable<int> EvaluationRoleId { get; set; }
        public string UIMessage { get; set; }
        public Nullable<int> StageTypeId { get; set; }
        public Nullable<int> OrganizationId { get; set; }
        public string CultureName { get; set; }
        public Nullable<int> ProjectTypeId { get; set; }
        public Nullable<int> ProfileTypeId { get; set; }

    }
}
