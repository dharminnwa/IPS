CREATE TABLE [dbo].[StageGroups] (
    [Id]                  INT            IDENTITY (1, 1) NOT NULL,
    [Name]                NVARCHAR (200) NULL,
    [Description]         NVARCHAR (MAX) NULL,
    [StartDate]           DATE           NULL,
    [EndDate]             DATE           NULL,
    [ParentStageGroupId]  INT            NULL,
    [ParentParticipantId] INT            NULL,
    [MonthsSpan]          INT            CONSTRAINT [DF_StageGroups_MonthsSpan] DEFAULT ((0)) NOT NULL,
    [WeeksSpan]           INT            CONSTRAINT [DF_StageGroups_WeeksSpan] DEFAULT ((0)) NOT NULL,
    [DaysSpan]            INT            CONSTRAINT [DF_StageGroups_DaysSpan] DEFAULT ((0)) NOT NULL,
    [HoursSpan]           INT            CONSTRAINT [DF_StageGroups_HoursSpan] DEFAULT ((0)) NOT NULL,
    [MinutesSpan]         INT            CONSTRAINT [DF_StageGroups_MinutesSpan] DEFAULT ((0)) NOT NULL,
    [ActualTimeSpan]      BIGINT         NULL,
    [TotalMilestones]     INT            CONSTRAINT [DF_StageGroups_TotalMilestones] DEFAULT ((0)) NOT NULL,
    [CreatedOn]           DATETIME       NULL,
    [CreatedBy]           INT            NULL,
    [ModifiedOn]          DATETIME       NULL,
    [ModifiedBy]          INT            NULL,
    [StartStageStartDate] DATETIME       NULL,
    [StartStageEndDate]   DATETIME       NULL,
    [MilestoneStartDate]  DATETIME       NULL,
    [MIlestoneEndDate]    DATETIME       NULL,
    CONSTRAINT [PK_StageGroups] PRIMARY KEY CLUSTERED ([Id] ASC)
);





















