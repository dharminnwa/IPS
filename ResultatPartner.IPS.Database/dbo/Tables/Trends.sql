CREATE TABLE [dbo].[Trends] (
    [Id]        INT            NOT NULL,
    [Direction] NVARCHAR (MAX) NOT NULL,
    CONSTRAINT [PK_Trends] PRIMARY KEY CLUSTERED ([Id] ASC)
);

