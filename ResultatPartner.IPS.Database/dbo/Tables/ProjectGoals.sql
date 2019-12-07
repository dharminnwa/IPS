CREATE TABLE [dbo].[ProjectGoals] (
    [Id]        INT            IDENTITY (1, 1) NOT NULL,
    [Goal]      NVARCHAR (MAX) NOT NULL,
    [Strategy]  NVARCHAR (MAX) NOT NULL,
    [ProjectId] INT            NOT NULL,
    CONSTRAINT [PK_ProjectGoals] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProjectGoals_Projects] FOREIGN KEY ([ProjectId]) REFERENCES [dbo].[Projects] ([Id])
);

