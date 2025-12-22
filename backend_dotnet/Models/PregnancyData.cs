using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public class PregnancyData
{
    public Guid Id { get; set; }
    
    public Guid PatientId { get; set; }
    
    public DateTime Dum { get; set; }
    public DateTime Dpp { get; set; }
    
    public double InitialWeight { get; set; }
    public double PreGestationalHeight { get; set; }
    public double PreGestationalBMI { get; set; }
    
    public BloodType BloodType { get; set; }
    public BloodType? SpouseBloodType { get; set; }
    
    public double WeightGoalMax { get; set; }
    public double WeightGoalMin { get; set; }
}
