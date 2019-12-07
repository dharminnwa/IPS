using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq.Expressions;


namespace IPS.Business
{
    public class QuestionsService : BaseService, IPS.Business.IQuestionsService
    {
        public IQueryable<Question> Get()
        {
            List<int> idList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(idList))
            {
                return _ipsDataContext.Questions.AsNoTracking().AsQueryable();
            }
            else
            {
                return _ipsDataContext.Questions.Where(q => q.OrganizationId != null && idList.Contains((int)q.OrganizationId)).AsNoTracking().AsQueryable();
            }
        }

        public IQueryable<Question> GetById(int id)
        {
            return _ipsDataContext.Questions.Where(q => q.Id == id).AsQueryable();
        }

        public Question Add(Question question)
        {

            List<Skill> skills = new List<Skill>(question.Skills);
            question.Skills.Clear();

            _ipsDataContext.Questions.Add(question);
            _ipsDataContext.SaveChanges();

            foreach (Skill skill in skills)
            {
                Skill skillDB = _ipsDataContext.Skills.Include("Questions").Where(s => s.Id == skill.Id).FirstOrDefault();
                if (!skillDB.Questions.Contains(question))
                {
                    skillDB.Questions.Add(question);
                }
            }

            _ipsDataContext.SaveChanges();
            return question;
        }

        public bool Update(Question question)
        {
            var original = _ipsDataContext.Questions
                .Include("Skills")
                .Include("PossibleAnswer")
                .Include(x => x.QuestionMaterial)
                .FirstOrDefault(q => q.Id == question.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(question);
                if (question.PossibleAnswer != null)
                {
                    if (original.PossibleAnswer == null)
                    {
                        original.PossibleAnswer = new PossibleAnswer();
                    }
                    original.PossibleAnswer.Answer = question.PossibleAnswer.Answer;
                }
                if (question.QuestionMaterial != null)
                {
                    if (original.QuestionMaterial == null)
                    {
                        original.QuestionMaterial = new QuestionMaterial();
                    }
                    original.QuestionMaterial.DocumentId = question.QuestionMaterial.DocumentId;
                    original.QuestionMaterial.Link = question.QuestionMaterial.Link;
                    original.QuestionMaterial.MaterialType = question.QuestionMaterial.MaterialType;
                }
                foreach (Skill dBSkill in original.Skills)
                {
                    Skill currentSkill = _ipsDataContext.Skills.Include("Questions").Where(s => s.Id == dBSkill.Id).FirstOrDefault();
                    currentSkill.Questions.Remove(original);
                }

                foreach (Skill dBSkill in question.Skills)
                {
                    Skill skill = _ipsDataContext.Skills.Include("Questions").Where(s => s.Id == dBSkill.Id).FirstOrDefault();
                    skill.Questions.Add(original);

                }

                _ipsDataContext.SaveChanges();
            }

            return true;

        }

        public void Delete(Question question)
        {
            Question original = _ipsDataContext.Questions.Include("Skills").Where(q => q.Id == question.Id).FirstOrDefault();

            if (original != null)
            {
                _ipsDataContext.Questions.Remove(question);
                _ipsDataContext.SaveChanges();
            }


        }


        public IQueryable<Question> QuestionFilter(IpsQuestionFilter ipsQuestionFilter)
        {

            // isInactive: true

            List<Question> filteredQuestions = new List<Question>();

            if (ipsQuestionFilter.IsActive == ipsQuestionFilter.IsInactive)
            {
                filteredQuestions = _ipsDataContext.Questions.Include("Skills").Include("ProfileType").ToList();
            }
            else
            {
                filteredQuestions = _ipsDataContext.Questions.Include("Skills").Include("ProfileType").Where(q => q.IsActive == ipsQuestionFilter.IsActive).ToList();
            }

            if (ipsQuestionFilter.ShowTemplatesOnly && filteredQuestions.Count > 0)
            {
                //filteredQuestions = _ipsDataContext.Questions.Include("Skills").Include("ProfileType").Where(q => q.IsActive == ipsQuestionFilter.IsActive && q.IsTemplate == ipsQuestionFilter.ShowTemplatesOnly).ToList();
                filteredQuestions = filteredQuestions.Where(q => q.IsTemplate == ipsQuestionFilter.ShowTemplatesOnly).ToList();
            }

            if (ipsQuestionFilter.OrganizationId > 0 && filteredQuestions.Count > 0)
            {
                filteredQuestions = filteredQuestions.Where(fq => fq.OrganizationId == ipsQuestionFilter.OrganizationId).ToList();
            }


            if (ipsQuestionFilter.StructureLevelId > 0)
            {

                filteredQuestions = filteredQuestions.Where(fq => fq.StructureLevelId == ipsQuestionFilter.StructureLevelId).ToList();
            }


            List<Question> questionListFilteredByIndustries = new List<Question>();

            if (ipsQuestionFilter.Industries != null && ipsQuestionFilter.Industries.Length > 0 && filteredQuestions.Count > 0)
            {
                foreach (int id in ipsQuestionFilter.Industries)
                {
                    Question question = filteredQuestions.Where(fq => fq.IndustryId == id).FirstOrDefault();
                    if (question != null)
                    {
                        questionListFilteredByIndustries.Add(question);
                    }

                }
                filteredQuestions = questionListFilteredByIndustries;
            }


            List<Question> questionListFilteredBySkills = new List<Question>();
            if (ipsQuestionFilter.Skills != null && ipsQuestionFilter.Skills.Length > 0 && filteredQuestions.Count > 0)
            {
                foreach (int id in ipsQuestionFilter.Skills)
                {
                    Skill skill = _ipsDataContext.Skills.Where(s => s.Id == id).FirstOrDefault();
                    Question question = filteredQuestions.Where(fq => fq.Skills.Contains(skill)).FirstOrDefault();
                    if (question != null)
                    {
                        questionListFilteredBySkills.Add(question);
                    }

                }
                filteredQuestions = questionListFilteredBySkills;
            }

            List<Question> questionListFilteredByProfileType = new List<Question>();
            if (ipsQuestionFilter.ProfileTypes != null && ipsQuestionFilter.ProfileTypes.Length > 0 && filteredQuestions.Count > 0)
            {
                foreach (int id in ipsQuestionFilter.ProfileTypes)
                {
                    Question question = filteredQuestions.Where(fq => fq.ProfileTypeId == id).FirstOrDefault();
                    if (question != null)
                    {
                        questionListFilteredByProfileType.Add(question);
                    }

                }
                filteredQuestions = questionListFilteredByProfileType;
            }

            List<Question> questionListFilteredByPerformanceGroup = new List<Question>();
            List<Question> questionListFromPerformanceGroups = new List<Question>();

            if (ipsQuestionFilter.PerformanceGroups != null && ipsQuestionFilter.PerformanceGroups.Count() > 0)
            {
                foreach (string name in ipsQuestionFilter.PerformanceGroups)
                {
                    List<PerformanceGroup> performanceGroupsByNames = _ipsDataContext.PerformanceGroups.Include("Link_PerformanceGroupSkills.Questions").Where(pg => pg.Name == name).ToList();
                    foreach (PerformanceGroup performanceGroup in performanceGroupsByNames)
                    {
                        foreach (Link_PerformanceGroupSkills lpgs in performanceGroup.Link_PerformanceGroupSkills)
                        {
                            questionListFromPerformanceGroups.AddRange(lpgs.Questions);
                        }
                    }

                }

                int[] questionIdsFromPerformanceGroups = questionListFromPerformanceGroups.Select(q => q.Id).ToArray();
                questionListFilteredByPerformanceGroup = filteredQuestions.Where(q => questionIdsFromPerformanceGroups.Contains(q.Id)).ToList();

                filteredQuestions = questionListFilteredByPerformanceGroup;
            }
            int[] questionIds = filteredQuestions.Select(q => q.Id).ToArray();

            return _ipsDataContext.Questions.Where(q => questionIds.Contains(q.Id)).AsNoTracking().AsQueryable();

        }


        public Question CloneQuestion(Question question, string textPattern)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    var newQuestion = CreateCopyQuestion(_ipsDataContext, question, textPattern);
                    dbContextTransaction.Commit();
                    return newQuestion;
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
        }

        public Question CreateCopyQuestion(IPSData dataContext, Question question, string copyText)
        {


            Question questionDB = dataContext.Questions.Include("Skills").Where(q => q.Id == question.Id).FirstOrDefault();

            Question newQuestion = new Question();

            newQuestion.QuestionText = copyText;
            newQuestion.Description = questionDB.Description;
            newQuestion.AnswerTypeId = questionDB.AnswerTypeId;
            newQuestion.IsActive = questionDB.IsActive;
            newQuestion.IsTemplate = questionDB.IsTemplate;
            newQuestion.OrganizationId = questionDB.OrganizationId;
            newQuestion.ProfileTypeId = questionDB.ProfileTypeId;
            newQuestion.ScaleId = questionDB.ScaleId;
            newQuestion.QuestionSettings = questionDB.QuestionSettings;
            newQuestion.SeqNo = questionDB.SeqNo;
            newQuestion.TimeForQuestion = questionDB.TimeForQuestion;

            dataContext.Questions.Add(newQuestion);
            dataContext.SaveChanges();

            foreach (Skill skill in questionDB.Skills)
            {
                Skill skillDB = dataContext.Skills.Include("Questions").Where(s => s.Id == skill.Id).FirstOrDefault();
                skill.Questions.Add(newQuestion);
                dataContext.SaveChanges();
            }

            return newQuestion;

        }

        public List<Question> getProfileQuestions(int profileId)
        {
            List<Question> result = new List<Question>();
            List<int> pgIds = _ipsDataContext.PerformanceGroups.Where(x => x.ProfileId == profileId).Select(x => x.Id).ToList();
            List<Link_PerformanceGroupSkills> link_PerformanceGroupSkills = _ipsDataContext.Link_PerformanceGroupSkills.Include("Questions.PossibleAnswer").Where(l =>  pgIds.Contains(l.PerformanceGroupId)).ToList();
            foreach (Link_PerformanceGroupSkills pgSkill in link_PerformanceGroupSkills)
            {
                result.AddRange(pgSkill.Questions);
            }
            return result;
        }

    }

}

