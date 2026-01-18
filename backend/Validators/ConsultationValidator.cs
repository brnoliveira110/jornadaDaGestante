using FluentValidation;
using backend.DTOs;

namespace backend.Validators;

public class ConsultationValidator : AbstractValidator<ConsultationCreateDto>
{
    public ConsultationValidator()
    {
        RuleFor(x => x.Date).NotEmpty().LessThanOrEqualTo(DateTime.Now);
        
        RuleFor(x => x.GestationalAgeWeeks).InclusiveBetween(0, 45);
        
        // Exemplo de regra condicional médica
        When(x => x.GestationalAgeWeeks > 12, () => {
            RuleFor(x => x.FetalHeartRate).GreaterThan(0)
                .WithMessage("BCF deve ser registrado após 12 semanas.");
        });

        RuleFor(x => x.BloodPressure)
            .Matches(@"^\d{2,3}x\d{2,3}$")
            .When(x => !string.IsNullOrEmpty(x.BloodPressure))
            .WithMessage("Pressão arterial deve estar no formato 120x80.");
    }
}
