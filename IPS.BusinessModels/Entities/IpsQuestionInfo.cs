using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.BusinessModels.Entities
{
    public class IpsQuestionInfo
    {
        public int QuestionNo { get; set; }
        public PerformanceGroup PerformanceGroup { get; set; }
        public Skill Skill { get; set; }
        public Question Question  { get; set; }
        public List<Training> Trainings { get; set; }
        public Answer ParticipantAnswer { get; set; }
        public Answer EvaluatorAnswer { get; set; }
        public List<Answer> EvaluatorAnswers { get; set; }
        public Answer AvgAnswer { get; set; }
        public Answer PreviousAnswer { get; set; }
        public EvaluationAgreement Agreement { get; set; }
        public EvaluationParticipant Participant { get; set; }
        public EvaluationParticipant Evaluator { get; set; }
        public User ParticipantUser { get; set; }

        public IpsQuestionInfo()
        {
        }

        public IpsQuestionInfo(int questionNo, PerformanceGroup performanceGroup, Skill skill, Question question, List<Training> trainings, Answer participantAnswer, Answer evaluatorAnswer, List<Answer> evaluatorAnswers, Answer avgAnswer, Answer previousAnswer, EvaluationAgreement agreement, EvaluationParticipant participant, EvaluationParticipant evaluator)
        {
            QuestionNo = questionNo;
            PerformanceGroup = performanceGroup;
            Skill = skill;
            Question = question;
            Trainings = trainings;
            ParticipantAnswer = participantAnswer;
            EvaluatorAnswer = evaluatorAnswer;
            EvaluatorAnswers = evaluatorAnswers;
            AvgAnswer = avgAnswer;
            PreviousAnswer = previousAnswer;
            Agreement = agreement;
            Participant = participant;
            Evaluator = evaluator;
        }
    }
}
