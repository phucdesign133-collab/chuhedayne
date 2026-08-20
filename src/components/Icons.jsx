import React from "react";

// Gom icon từ nhiều nguồn khác nhau vào đây
import { FaEdit, FaTrash, FaCalendarAlt, FaBullseye, FaMoneyBillWave,FaSearch  } from "react-icons/fa";
import { MdFlag, MdSave, MdClose, MdOutlineDateRange } from "react-icons/md";
import { BsCheckCircle, BsPlusLg } from "react-icons/bs";

// Xuất khẩu (Export) các icon dưới dạng component hoặc gom thành đối tượng tùy ý
export const EditIcon = (props) => <FaEdit {...props} />;
export const TrashIcon = (props) => <FaTrash {...props} />;
export const CalendarIcon = (props) => <FaCalendarAlt {...props} />;
export const GoalIcon = (props) => <FaBullseye {...props} />;
export const MoneyIcon = (props) => <FaMoneyBillWave {...props} />;
export const FlagIcon = (props) => <MdFlag {...props} />;
export const SaveIcon = (props) => <MdSave {...props} />;
export const CloseIcon = (props) => <MdClose {...props} />;
export const PlusIcon = (props) => <BsPlusLg {...props} />;