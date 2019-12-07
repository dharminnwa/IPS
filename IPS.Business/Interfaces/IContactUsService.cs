using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace IPS.Business
{
   public interface IContactUsService
    {
        ContactU Add(ContactU ContactU);
        ContactU GetContact();
    }
}
