CREATE TABLE [dbo].[ProfileTypes] (
    [Id]             INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (250) NOT NULL,
    [IsStandard]     BIT            CONSTRAINT [DF_ProfileTypes_IsStandard] DEFAULT ((0)) NOT NULL,
    [OrganizationId] INT            NULL,
    CONSTRAINT [PK_ProfileTypes] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_ProfileTypes_Organizations] FOREIGN KEY ([OrganizationId]) REFERENCES [dbo].[Organizations] ([Id])
);

