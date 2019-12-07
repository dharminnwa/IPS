using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business.Interfaces
{
    public interface INotification
    {
        void Send(IpsAddress address, IpsMessage message);
    }
}
