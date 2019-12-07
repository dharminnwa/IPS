using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Twilio;

namespace IPS.Business.Exceptions
{

    public class TwilioException : Exception
    {
        private RestException _restException;

        public RestException RestException
        {
            get { return _restException; }
        }

        public TwilioException()
        {
        }

        public TwilioException(string message)
            : base(message)
        {
        }

        public TwilioException(string message, Exception inner)
            : base(message, inner)
        {
        }

        public TwilioException(RestException restException)
            : base(restException.Message)
        {
            _restException = restException;
        }
    }
}
