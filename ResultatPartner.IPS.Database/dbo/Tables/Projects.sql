CREATE TABLE [dbo].[Projects] (
    [Id]                INT            IDENTITY (1, 1) NOT NULL,
    [Name]              NVARCHAR (MAX) NOT NULL,
    [Summary]           NVARCHAR (MAX) NULL,
    [VisionStatement]   NVARCHAR (MAX) NULL,
    [IsActive]          BIT            NOT NULL,
    [ExpectedStartDate] DATETIME       NOT NULL,
    [ExpectedEndDate]   DATETIME       NOT NULL,
    [MissionStatement]  NVARCHAR (MAX) NULL,
    [OrganizationId]    INT            NULL,
    [CreatedBy]         INT            NULL,
    [ModifiedBy]        INT            NULL,
    [CreatedOn]         DATETIME       NULL,
    [ModifiedOn]        DATETIME       NULL,
    [StartedOn]         DATETIME       NULL,
    [CreatedAsRoleId]   NVARCHAR (128) NULL,
    [ModifiedAsRoleId]  NVARCHAR (128) NULL,
    CONSTRAINT [PK_Projects] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Projects_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id]),
    CONSTRAINT [FK_Projects_Users] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users] ([Id])
);









