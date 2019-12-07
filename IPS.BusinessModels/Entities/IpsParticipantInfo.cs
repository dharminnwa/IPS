using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsParticipantInfo
    {
        public  EvaluationParticipant Participant { get; set; }
        public User ParticipantUser { get; set; }

        public IpsParticipantInfo(EvaluationParticipant participant, User participantUser)
        {
            Participant = participant;
            ParticipantUser = participantUser;
        }
    }
}
