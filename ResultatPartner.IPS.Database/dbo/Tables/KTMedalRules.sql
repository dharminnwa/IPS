CREATE TABLE [dbo].[KTMedalRules] (
    [Id]          INT           IDENTITY (1, 1) NOT NULL,
    [Name]        VARCHAR (500) NOT NULL,
    [BronzeStart] DECIMAL (18,16)  NOT NULL,
    [BronzeEnd]   DECIMAL (18,16)  NOT NULL,
    [SilverEnd]   DECIMAL (18,16)  NOT NULL,
    CONSTRAINT [PK_KTMedalRule] PRIMARY KEY CLUSTERED ([Id] ASC)
);

