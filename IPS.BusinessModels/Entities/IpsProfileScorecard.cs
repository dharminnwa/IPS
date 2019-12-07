using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.Enums;
using IPS.Data;

namespace IPS.BusinessModels.Entities
{
    public class IpsProfileScorecard
    {
        public int ProfileId { get; set; }
        public string ProfileName { get; set; }
        public string ProfileDescription { get; set; }
        public List<int> ParticipantsId { get; set; }
        public int ProfileTypeId { get; set; }
        public Scale Scale { get; set; }

        public double AverageScore { get; set; }
        public double WeakAverageScore { get; set; }
        public double StrongAverageScore { get; set; }
        public string ProfileTrend { get; set; }
        public string ProfileWeakTrend { get; set; }
        public string ProfileStrongTrend { get; set; }

        public IpsSkillPI[] WeakAreas { get; set; }
        public IpsSkillPI[] StrongAreas { get; set; }

        public IpsPerformanceGroupPI[] PerformanceGroups { get; set; }
        public List<IpsProfileScorecard> EvaluatorsProfileScorecards { get; set; }
        public List<IpsProfileScorecard> ExtraProfileScorecards { get; set; }
    }

    public class IpsPerformanceGroupPI
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Perspective { get; set; }
        public string Trend { get; set; }
        public double Score { get; set; }
        public decimal Goal { get; set; }
        public decimal? Benchmark { get; set; }
        public string Weight { get; set; }
        public string CSF { get; set; }
        public string Action { get; set; }
        public string Performance { get; set; }
        public string Progress { get; set; }

        public IpsSkillPI[] Skills { get; set; }
        public IpsSkillPI[] EvaluatorsSkills { get; set; }
    }

    public class IpsSkillPI
    {
        public int Id { get; set; }
        public int Index { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Trend { get; set; }
        public double Score { get; set; }
        public string Comment { get; set; }
        public decimal? Benchmark { get; set; }
        public string Weight { get; set; }
        public string CSF { get; set; }
        public string Action { get; set; }
        public double Baseline { get; set; }
        public string Performance { get; set; }
        public string Progress { get; set; }
        public decimal Goal { get; set; }

        public IpsQuestionPI[] Questions { get; set; }
    }

    public class IpsQuestionPI
    {
        public int Id { get; set; }
        public string QuestionText { get; set; }
        public string Trend { get; set; }
        public double Score { get; set; }
    }
}